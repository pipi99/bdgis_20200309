/*控制面板类*/

(function ctrls_theme(){
	
	//3.0 矢量
	var THEMES=[
		{
			name:"defaultStyle",
			styleId:"151ee65711668a3dd5ae28ee4fb1115e",
			label:"常规"
		},
		{
			name:"wenzhonghuang",
			styleId:"f56fdf2d772cd6f103bdf3878a45f37b",
			label:"稳重黄"
		}
	];
	
	// 定义一个控件类，即function    
    function WyControl(){    
        // 设置默认停靠位置和偏移量  
        this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;    
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
        var divhtml = '<div id="themeapp" >'+	
        					'<el-input-number size="mini" v-model="mapzoom" @change="handleZoomChange" :min="4" :max="19" label="缩放比例"></el-input-number>'+
        					'<el-button size="mini"  type="success" icon="el-icon-picture-outline-round" v-popover:popover_themes></el-button>'+
        				  	'<el-popover  ref="popover_themes"  trigger="click">'+
					          '<el-radio-group v-model="themes" @change="themeSwitch" size="mini">';
					          	for(var i=0;i<THEMES.length;i++){
					          		divhtml+='<el-radio-button label="'+THEMES[i].label+'"></el-radio-button>';
				            	}
					        divhtml+='</el-radio-group>'+
			          		'</el-popover>'+
			          	'</div>';
		div.innerHTML = divhtml;							        	
        // 添加DOM元素到地图中   
        map.getContainer().appendChild(div);    
        // 将DOM元素返回  
        return div;    
    }
    
	if(getQueryVariable("wg")){
		// 创建控件实例    
        var myCtrl = new WyControl();    
        // 添加到地图当中    
        map.addControl(myCtrl);

	    var themevm = new Vue({
	        el: '#themeapp',
	        data: function() {
	            return {                
	            	themes:"",
	            	themeTimeout:"",
	            	mapzoom:map.getZoom()
	            	
	            }
	        },
	        mounted(){
	        	for(var i=0;i<THEMES.length;i++){
	        		if(THEMES[i].name==mapStyle){
	        			this.themes = THEMES[i].label;
	        		}
	        	}
	        	this.setTheme();
	        	var _that = this;
	        	//同步缩放控件值
	        	map.addEventListener("zoomend", function(){    
	        		_that.mapzoom = this.getZoom()    
	        	});
	        },
	        
	      	methods:{
	      		handleZoomChange () {
	      			map.setZoom(this.mapzoom);
	            },
	      		themeSwitch (data) {
	            	//样式延迟设置，避免点击太快导致样式 js未完全加载导致的报错
	            	clearTimeout(this.themeTimeout);
	            	var _that = this;
	            	this.themeTimeout = setTimeout(function(){
	            		_that.setTheme();
	            	},1000)
	            },
	            setTheme(){
    				for(var i=0;i<THEMES.length;i++){
                		if(THEMES[i].label==this.themes){
                			mapStyle = THEMES[i].name;
                			map.setMapStyleV2({styleId: THEMES[i].styleId});
                		}
                	}
	            }
	        }
	    })
	}else{
		for(var i=0;i<THEMES.length;i++){
    		if(THEMES[i].name==mapStyle){
    			mapStyle = THEMES[i].name;
    			map.setMapStyleV2({styleId: THEMES[i].styleId});
    		}
    	}
	}
})();
