/*地图图片自动下载*/
var downloadtimeout;
function mapDownload(){
	//自动下载地图
	this.downauto = true;
	//起始坐标
	var startx = 63;
	var starty = 17;
	
	//结束坐标
	var endx = 140;
	var endy = 60;
	
	var zoomend = 19;  // 最大缩放等级
	
	//移动点坐标
	var px = startx;
	var py = starty;
	
	// 9-19 之间
	var _zoom = 4; //当前缩放比
	//经纬度移动步长  4级开始
	var xstep =[210,100,50,25,14,6,4,2,1,0.4,0.2,0.1,0.04,0.03,0.02,0.01];
	var ystep =[62,29,12,6.3,3.5,2.4,1.2,0.6,0.3,0.16,0.08,0.03,0.02,0.008,0.004,0.002];
	
	//执行地图缩放
	function downloadMap(){
		console.log(_zoom+":"+"("+px+","+py+")");
		if(map.getZoom()!=_zoom){
			_zoom = map.getZoom();
		}
		map.panTo(new BMap.Point(px,py));
//		map.centerAndZoom(new BMap.Point(px,py),_zoom);  //移动
	}
	
	
	//横向滚动
	this.download =function(){
		//超出横坐标
		if(px>endx){
			px = startx;
			//超出纵坐标，完成
			if(py>endy){
				//下一个缩放级别
				_zoom++;
				map.setZoom(_zoom);
				px = startx;
				py = starty;
				//结束
				if(_zoom>zoomend){
					alert("完成下载瓦片");
				}
			}else{
				py+= ystep[_zoom-4];
			}
		}else{
			px += xstep[_zoom-4];
		}
		downloadMap();
	}
}
var d = new mapDownload()