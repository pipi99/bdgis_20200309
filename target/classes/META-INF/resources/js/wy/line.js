/*电厂查询及定位*/
var line_Layer ;
var  line_dataSet;

var  linepoint_Layer ;
var  linepoint_dataSet;

function findlines( form){
	
	let plant_img = new Image();plant_img.src = 'images/locate/plant.png';
	let substation_img = new Image();substation_img.src = 'images/locate/substation.png';
	let tower_img = new Image();tower_img.src = 'images/locate/tower.png';
	
	
    //未选择则不显示
    if(form.checkedLineTypes.length==0||form.checkedVoltages.length==0){
    	if(line_Layer){
    		$("#line_count").text(0);
    		if(line_dataSet){
        		line_dataSet.set([]);
        		linepoint_dataSet.set([]);
        	}
            line_Layer.destroy();
            linepoint_Layer.destroy();
        }
        return
    }
    if(vm){
    	vm.line_loading = true;
	}
    var dccId = "";
    if(form.dccvalue){
    	dccId = form.dcc_zd_checked?("zd"+form.dccvalue[form.dccvalue.length-1]):form.dccvalue[form.dccvalue.length-1];
    }
    $.ajax({
        url: "/wyxt_ubqts_bdgis/gis/findLines",
        data:  {lineType:form.checkedLineTypes.join(),voltage:form.checkedVoltages.join()},
        type: "get",
        dataType: "json",
        success: function(linejson) {
        	if(line_dataSet){
        		line_dataSet.set([]);
        		linepoint_dataSet.set([]);
        	}
        	console.log(linejson.length);
        	
        	//线路坐标
            var linedata = [];
            //起点终点坐标
            var lineS_Edata = [];
            
            var line_count=0;
            for(var i=0;i<linejson.length;i++){
                let line = linejson[i];
//                if(line.points.length<2||line.name.indexOf("龙政直流")==-1){
                if(line.points.length<2){
                	continue;
                }
                
                //过滤直流线路
                if(line.lineType=="DC"){
                	if(line.name.indexOf("Ⅱ")!=-1){
                		continue;
                	}
                	line.name = line.name.replace(/直流.*/,"直流");
                }
                
                line_count++
                let coordinates = [];//坐标
                
                // 有杆塔//非特殊线路
                if(line.points.length > 2&&!specialLine(line.name)){
                	
                	var prePoint;
                	for(var k=0;k<line.points.length;k++){
                		if(line.points[k].lon&&line.points[k].lat){
                        	
                    		if(line.name.indexOf("龙政直流")!=-1&&line.points[k].seq>1995){
                    			break;
                            }else if(line.name.indexOf("雁淮直流")!=-1&&line.points[k].seq>1560){
                    			break;
                            }else if(line.points[k].lon&&line.points[k].lat){
                            	//非首尾点
                            	if(k>0&&k<line.points.length-1){
                            		//初始化
                            		if(!prePoint){
                            			prePoint = line.points[k];
                            		}
                            		//判断前后点距离，超出给定距离的不展示
//                        			if(rightPointDistance(prePoint,line.points[k])&&!specialPointDel(line.points[k].name)){
                            		if(!specialPointDel(line.points[k].name)){
                                		prePoint = line.points[k];
                                		coordinates.push([line.points[k].lon,line.points[k].lat]);
                                	}
                        		}else{
                        			coordinates.push([line.points[k].lon,line.points[k].lat]);
                        		}
                            }
                        }
                		
                		
                        
                    }
                }else{
                	//算法二  取起始点
                	coordinates = getS_Epoint(line);
                }
                linedata.push({
                    geometry: {
                        type: 'LineString',
                        coordinates: coordinates
                    },
                    
                    data: line,
                    strokeStyle:getColor(line.voltageType),
//                    strokeStyle:"rgb(255,255,255,0.1)",
                    lineDash: (line.lineType=="AC"?[2]:[]),
                    count: 30 * Math.random()
                });
                
                if(coordinates.length>=2){
                	var S = coordinates[0];
                    var E = coordinates[coordinates.length-1];
                    var s_data = line.points[0];
                    var e_data = line.points[line.points.length-1];
                    s_data.linename = e_data.linename = line.name;
                    lineS_Edata.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [S[0], S[1]]
                        },
                        icon: getIcon(s_data.ptype),
                        data: s_data,
                        fillStyle:getColor(line.voltageType),
                        size: 3,
                    });
                    
                    lineS_Edata.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [E[0], E[1]]
                        },
                        icon: getIcon(e_data.ptype),
                        data: e_data,
                        fillStyle:getColor(line.voltageType),
                        size: 3,
                    });
                }
            }      
            
            $("#line_count").text(line_count);
            var options = {
        		methods: {
                    mousemove: function (item,e) {
                    	
                        if(item){
                            var sContent =
                                "<div >" + item.data.name+"  <br/>"
                                +(item.data.lineType=="AC"?"交流":"直流")+getVoltageName(item.data.voltageType)+"  <br/>"+
                                item.data.length+"KM"+
                                "</div>";
                            var opts = {
                                // width : 250,     // 信息窗口宽度
                                //height: 100,     // 信息窗口高度
                                title : item.data.plantName  // 信息窗口标题
                            }
                            var infoWindow = new BMap.InfoWindow(sContent, opts);  // 创建信息窗口对象  
                            map.openInfoWindow(infoWindow,  new BMap.Point(e.point.lng, e.point.lat));      // 打开信息窗口
                        }
                    }
                },
//        		globalCompositeOperation: 'lighter', // 颜色叠加方式
                strokeStyle: 'rgba(255, 255, 255, 1)',
                lineWidth: 2,
                draw: 'simple'
            }
            
            //起始点定位
            var SEOptions = {
                    methods: {
                    	mousemove: function (item) {
                            if(item){
                                var sContent =
                                    "<div >" + 
                                	getPointTypeName(item.data.ptype)+"："+(item.data.name?item.data.name.replace("S","").replace("E",""):"")+
//                                    getPointTypeName(item.data.ptype)+"："+(item.data.name)+
                                    "</div>";
                                var opts = {
                                    // width : 250,     // 信息窗口宽度
                                    //height: 100,     // 信息窗口高度
                                    title : item.data.plantName  // 信息窗口标题
                                }
                                var infoWindow = new BMap.InfoWindow(sContent, opts);  // 创建信息窗口对象  
                                map.openInfoWindow(infoWindow,  new BMap.Point(item.geometry.coordinates[0], item.geometry.coordinates[1]));      // 打开信息窗口
                            }
                        }
                    },
//                    draw: 'icon'
                    draw: 'simple'
                }
            
            if(line_Layer){
            	//线路
            	line_dataSet.set(linedata);
            	line_Layer.show();
            	line_Layer.bindEvent();
            	
            	//起始点
            	linepoint_dataSet.set(lineS_Edata);
            	linepoint_Layer.show();
            	linepoint_Layer.bindEvent();
            }else{
            	//线路
            	line_dataSet = new mapv.DataSet(linedata);
                line_Layer = new mapv.baiduMapLayer(map, line_dataSet, options);
                
                //起始点
                linepoint_dataSet = new mapv.DataSet(lineS_Edata);
            	linepoint_Layer= new mapv.baiduMapLayer(map, linepoint_dataSet, SEOptions);
            }
            vm.line_loading = false;
        }
    });

    /**
     * 获取颜色
     * @param {电压等级} key 
     */
    function getColor(key){
        for(var i=0;i<vm.lineColors.length;i++){
            if(key==vm.lineColors[i].key){
                return colorRgb(vm.lineColors[i].color);
            }
        }
    }
    
    
    
    /**
     * 获取颜色
     * @param {电压等级} key 
     */
    function getPointTypeName(key){
    	key = key.replace(/ /g,'');
        switch(key){
        	case 'plant':return "电厂";
        	case 'substation':return "变电站"
        	case 'tower':return "杆塔"
        }
        return '';
    }
    
    /**
     * 取起始点
     */
    function getS_Epoint(line){
    	var coordinates = [];
    	//算法二  取起始点
        for(var x=0;x<line.points.length;x++){
            if(line.points[x].lon&&line.points[x].lat){
                coordinates.push([line.points[x].lon,line.points[x].lat]);
                break;
            }
        }
        
        for(var x=line.points.length-1;x>0;x--){
            if(line.points[x].lon&&line.points[x].lat){
                coordinates.push([line.points[x].lon,line.points[x].lat]);
                break;
            }
        }
        return coordinates;
    }
    
    /**
     * 获取图标
     * @param {点类型} key 
     */
    function getIcon(key){
    	key = key.replace(/ /g,'');
        switch(key){
        	case 'plant': return plant_img;
        	case 'substation':return substation_img;
        	case 'tower':return tower_img;
        }
        return '';
    }
    
    /**
     * 获取电压等级名称
     * @param {电压等级} key 
     */
    function getVoltageName(key){
        for(var i=0;i<vm.lineColors.length;i++){
            if(key==vm.lineColors[i].key){
                return vm.lineColors[i].label;
            }
        }
    }
    
    /**只连点的线路*/
    function specialLine(name){
    	var lineNames = "河泉II线,河泉I线,海万一线,高天二线,妃裕一线,博洪一线,昱岳二线,丰万二线,海万一线";
    	return lineNames.indexOf(name)!=-1;
    }
    
    /**移除特殊点*/
    function specialPointDel(name){
    	var delNames = "东锦I线#3601,江城线#2901,江城线#2902,三江II线#14501,安塘I线#1,安塘I线#2,宾复II线#1";
    	var del =  delNames.indexOf(name)!=-1;
    	
    	
    	return del;
    }
    
    /**
     * 16进制颜色转rgb
     */
    function colorRgb(color16) {
	  // 16进制颜色值的正则
	  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	  // 把颜色值变成小写
	  var color = color16.toLowerCase();
	  if (reg.test(color)) {
	    // 如果只有三位的值，需变成六位，如：#fff => #ffffff
	    if (color.length === 4) {
	      var colorNew = "#";
	      for (var i = 1; i < 4; i += 1) {
	        colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
	      }
	      color = colorNew;
	    }
	    // 处理六位的颜色值，转为RGB
	    var colorChange = [];
	    for (var i = 1; i < 7; i += 2) {
	      colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
	    }
	    return "RGB(" + colorChange.join(",") + ",0.5)";
//	    return "RGB(255,255,255,0.3)";
	  } else {
	    return color;
	  }
	};
	
    /**
     * 计算坐标是否在合理距离内
     */
    function rightPointDistance(p1,p2){
    	var lon = Math.abs(p1.lon - p2.lon);
    	var lat = Math.abs(p1.lat - p2.lat);
    	return lon<0.1&&lat<0.1;
    }
}