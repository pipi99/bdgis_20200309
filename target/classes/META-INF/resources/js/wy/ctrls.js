/*控制面板类*/

function ctrls_simple(){
    // 定义一个控件类，即function    
    function WyControl(){    
        // 设置默认停靠位置和偏移量  
        this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;    
        this.defaultOffset = new BMap.Size(100, 10);    
    }    
    // 通过JavaScript的prototype属性继承于BMap.Control   
    WyControl.prototype = new BMap.Control();

    // 自定义控件必须实现initialize方法，并且将控件的DOM元素返回   
    // 在本方法中创建个div元素作为控件的容器，并将其添加到地图容器中   
    WyControl.prototype.initialize = function(map){    
        // 创建一个DOM元素   
        var div = document.createElement("div");    

        // 添加文字说明    
        div.innerHTML = '<div id="app" >'+	
                            '<el-button size="mini"  type="success" icon="el-icon-map-location" v-popover:popover_plant></el-button>'+

                            /*****面板*****/
                            '<el-popover title="操作面板" ref="popover_plant" placement="bottom" width="800"  trigger="click">'+
                                '<el-row>'+
                                    '<el-col :span="6"><div class="el-table-add-row" style="width: 99.2%;cursor: pointer" @click="addRow()"><span>+ 添加</span></div></el-col>'+
                                    '<el-col :span="18"><el-input v-model="search" size="mini" placeholder="路径名称搜索"/></el-col>'+
                                '</el-row>'+
                                '<el-row>'+
                                    '<el-col :span="24">' +
                                        '<el-table ref="multipleTable" highlight-current-row  :data="tableData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))" height="350" style="width: 100%">'+
                    '                    <el-table-column label="操作" width="150" fixed>' +
                    '                        <template slot-scope="scope">' +
                    '                            <span class="el-tag el-tag--info el-tag--mini" style="cursor: pointer;" @click="pwdChange(scope.row,scope.$index,true)">' +
                    '                                {{scope.row.isSet?\'保存\':"修改"}}' +
                    '                            </span>' +
                    '                            <span v-if="!scope.row.isSet" class="el-tag el-tag--danger el-tag--mini" style="cursor: pointer;" @click="delRow(scope.row)">' +
                    '                                删除' +
                    '                            </span>' +
                    '                            <span v-else class="el-tag  el-tag--mini" style="cursor: pointer;" @click="pwdChange(scope.row,scope.$index,false)">' +
                    '                                取消' +
                    '                            </span>' +
                                                '<span  v-if="!!scope.row.road" class="el-tag  el-tag--mini" style="cursor: pointer;margin-left:4px" @click="locate(scope.row)">' +
                                                '定位' +
                                                '</span>' +

                    '                        </template>' +
                    '                    </el-table-column>'+
                    '                   <el-table-column v-for="(v,i) in columns" :prop="v.field" :label="v.title" :width="v.width">' +
                    '                        <template slot-scope="scope">' +
                    '                            <span v-if="scope.row.isSet&&(v.field!=\'duration\')&&(v.field!=\'distance\')">' +
                    '                                <el-input size="mini" placeholder="请输入内容" v-model="sel[v.field]">' +
                    '                                </el-input>' +
                    '                            </span>' +
                    '                            <span v-else>{{scope.row[v.field]}}</span>' +
                    '                        </template>' +
                    '                    </el-table-column>' +
                                    '</el-table>'+
                                '</el-col>'+
                            '</el-row>'+
                        '</el-popover>'+
                    '</div>';
        // 添加DOM元素到地图中   
        map.getContainer().appendChild(div);    
        // 将DOM元素返回  
        return div;    
    }

    // 创建控件实例    
    var myCtrl = new WyControl();    
    // 添加到地图当中    
    map.addControl(myCtrl);


    vm = new Vue({
        el: '#app',
        data: function() {
            return {
                columns: [
                    { field: "index", title: "编号", width: 60 },
                    { field: "name", title: "名称", width: 100 },
                    { field: "duration", title: "时常", width: 150 },
                    { field: "distance", title: "路长", width: 150 },
                    { field: "road", title: "路径", width: 150 },
                    { field: "point", title: "坐标", width: 200 },
                    { field: "address", title: "地址", width: 350 },

                ],
                sel:{},
                tableData: [],
                search: '',
                line_dataSet:null,
                line_Layer:null
            }
        },
        mounted(){
            this.queryLines();
        },
        
      	methods:{
            //添加
            addRow() {
                for (let i of this.tableData) {
                    if (i.isSet) return this.$message.warning("请先保存当前编辑项");
                }
                let j = { "index": "", "name": "", "road": "", "point": "", "address": "", "time": "", "isSet": true, "distance": "" };
                this.tableData.push(j);
                this.sel = JSON.parse(JSON.stringify(j));
            },
            //添加
            delRow(row) {
                if(!confirm("确定删除？")){return;}
                //点击删除
                for (let i=0;i< this.tableData.length;i++) {
                    let x =  this.tableData[i];
                    if (x.index == row.index) {
                        this.tableData.splice(i, 1);
                        break;
                    }
                }
                $.ajax({
                    url: "livGis/saveData",
                    data:{"datas":JSON.stringify(vm.tableData)},
                    type: "post",
                    success: function (result) {
                        vm.queryLines();
                    }
                });
            },
            //修改
            pwdChange(row, index, cg) {
                //点击修改 判断是否已经保存所有操作
                for (let i of this.tableData) {
                    if (i.isSet && i.index != row.index) {
                        this.$message.warning("请先保存当前编辑项");
                        return false;
                    }
                }
                //是否是取消操作
                if (!cg) {
                    this.queryLines();
                    return false;
                }

                //提交数据
                if (row.isSet) {
                    //项目是模拟请求操作  自己修改下
                    let data = JSON.parse(JSON.stringify(this.sel));
                    for (let k in data) row[k] = data[k];
                    row.isSet = false;
                    //保存的时候执行一次定位
                    if(row.road){
                        this.locate(row);
                    }

                    this.saveData();
                } else {
                    this.sel = JSON.parse(JSON.stringify(row));
                    row.isSet = true;
                }
            },

            //保存列表数据
            saveData(){
                $.ajax({
                    url: "livGis/saveData",
                    data:{"datas":JSON.stringify(vm.tableData)},
                    type: "post",
                    success: function (result) {
                        vm.queryLines();
                    }
                });
            },

            //查询列表数据
            queryLines(){
                let that = this;
                $.ajax({
                    url: "livGis/findData",
                    type: "get",
                    success: function (linejson) {
                        linejson=linejson.replace(/\r/g,"");
                        let tableDatas = JSON.parse(linejson) ;
                        that.tableData = tableDatas;
                    }
                });
            },
            //定位按钮
            locate(road) {
                if(vm.line_Layer){
                    vm.line_dataSet.set([]);
                    vm.line_Layer.destroy();
                }
                map.clearOverlays();

                this.markRoad(road);
            },
            markRoad(road){
                let parr = [];
                let step = road.road?road.road.split(","):[];
                for(let k=0;k<step.length;k++){
                    for(let i=0;i<this.tableData.length;i++){
                        if(this.tableData[i].index==step[k]){
                            parr.push(this.tableData[i].point);
                        }
                    }
                }

                var pstr = parr.join();

                // 外网下载路径  env模式才会下载
                let points = pstr.split(",");
                for(let i=0;i<points.length;i+=2){
                    let start = new BMap.Point(points[i],points[i+1]);
                    if(i+3<points.length){
                        let end = new BMap.Point(points[i+2],points[i+3]);
                        this.findRoadPoints(start,end);
                    }
                }

                // //执行路径定位
                $.ajax({
                    url: "livGis/findRoadPoints",
                    data:{"points":pstr},
                    type: "post",
                    dataType:"json",
                    success: function (linejson) {
                        let path = linejson.path;//路径

                        let duration = linejson.duration;//时常
                        let distance = linejson.distance;//距离

                        //更新
                        for(let i=0;i<vm.tableData.length;i++){
                            if(vm.tableData[i].index==road.index){
                               if(!vm.tableData[i].duration||!vm.tableData[i].distance){
                                    vm.tableData[i].duration = Math.floor(duration/3600 * 100) / 100+"小时";
                                    vm.tableData[i].distance = Math.floor(distance/1000 * 100) / 100+"千米";
                                    vm.saveData();
                                    break;
                               }
                            }
                        }

                        let coordinates = [];//坐标路径定位
                        let pointArray = [];//范围定位
                        let arr = path.split(";");
                        for(let i=0;i<arr.length;i++){
                            let p = arr[i].split(",");
                            coordinates.push(p);
                            pointArray.push(new BMap.Point(p[0],p[1]));
                        }
                        //线路数据
                        let linedata = [];
                        linedata.push({
                            geometry: {
                                type: 'LineString',
                                coordinates: coordinates
                            },
                            strokeStyle:"#1DC01D",
                            lineDash:[],
                            count: 30 * Math.random()
                        });

                        let options = {
                            methods: {
                                mousemove: function (item,e) {

                                    if(item){
                                    }
                                }
                            },
                            strokeStyle: 'rgba(255, 255, 255, 1)',
                            lineWidth: 5,
                            draw: 'simple'
                        }
                        //起始点定位
                        let SEOptions = {
                            draw: 'icon',
                            width: 40, // 规定图像的宽度
                            height: 33, // 规定图像的高度
                            size: 20, // 添加点击事件时候可以用来设置点击范围
                            sx: 0.1, // 开始剪切的 x 坐标位置
                            sy: 0.1, // 开始剪切的 y 坐标位置
                            swidth: 40, // 被剪切图像的宽度
                            sheight: 33, // 被剪切图像的高度
                        }
                        let lineS_Edata=[];
                        let start_img = new Image();start_img.src = 'images/locate/dest_markers.png';
                        let end_img = new Image();end_img.src = 'images/locate/dest_markers.png';


                        //线路
                        vm.line_dataSet = new mapv.DataSet(linedata);
                        vm.line_Layer = new mapv.baiduMapLayer(map, vm.line_dataSet, options);

                        let myIcon1 = new BMap.Icon("images/locate/dest_markers.png", new BMap.Size(40, 34), {
                            anchor: new BMap.Size(15, 30),
                            imageOffset: new BMap.Size(0, 0 )   // 设置图片偏移
                        });
                        let marker1 = new BMap.Marker(new BMap.Point(coordinates[0][0],coordinates[0][1]), {icon: myIcon1});
                        map.addOverlay(marker1);

                        let myIcon2 = new BMap.Icon("images/locate/dest_markers.png", new BMap.Size(40, 34), {
                            anchor: new BMap.Size(15, 30),
                            imageOffset: new BMap.Size(0, 0 - 33)   // 设置图片偏移
                        });
                        let marker2 = new BMap.Marker(new BMap.Point(coordinates[coordinates.length-1][0],coordinates[coordinates.length-1][1]), {icon: myIcon2});
                        map.addOverlay(marker2);
                        map.setViewport(pointArray);    //调整视野
                    }
                });

            },
            findRoadPoints(startP,endP){
                var options = {
                    onSearchComplete: function(results){
                        console.log("---"+driving.getStatus());
                        if (driving.getStatus() == BMAP_STATUS_SUCCESS){
                            // 获取第一条方案
                            var plan = results.getPlan(0);
                            //返回第一条线路
                            // 获取方案的驾车线路
                            var route = plan.getRoute(0);
                            // 获取每个关键步骤，并输出到页面
                            var path = route.getPath();
                            console.log("onSearchComplete="+path);
                        }
                    }
                };
                let driving = new BMap.DrivingRoute(map,options);
                driving.search(startP, endP);

            }
        }, watch:{
        }
    })
}

//窗口大小的时候地图设置
function ctrl_window(){
	//是否全屏
    var isFull = getQueryVariable("isFull");
    if(isFull==="false"){
    	map.centerAndZoom(point,4);  //
    }else{
    	map.centerAndZoom(point,6);  //
    	 //缩放控件
        var opts2 = {
            type: BMAP_NAVIGATION_CONTROL_LARGE
        }
        map.addControl(new BMap.NavigationControl(opts2));
    }
}

/*浏览器设置，解决ajax content-download 响应时间长的问题*/
function browserSet(){
	window.addEventListener("mousewheel", (e) => {
	   if (e.deltaY === 1) {
	     e.preventDefault();
	     console.log("ctrl  -  mousewheel")
	   }
     })
}
ctrl_window()
ctrls_simple();
browserSet()