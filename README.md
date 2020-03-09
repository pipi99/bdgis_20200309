# 一、介绍
完全基于百度API，支持离线矢量瓦片本地访问。
* 支持各种自定义样式
* 自动下载矢量瓦片（地图自动移动、自动缩放）
* 手动下载矢量瓦片（手动 拖动访问地图即可）
* Vue+ElementUI控制面板

# 二、操作指南
 访问：<http://localhost:10010/?env=dev&wg=1>
 
> 参数说明 （注意：生产模式下env参数必须为prod(默认)，否则会请求外网下载瓦片！！！！）

|  参数名称   | 值  | 是否必选 |
|  ----  | ----  | ---- |
| env（运行环境）  | prod:生产模式（默认），dev:手动地图下载模式，autodownload:自动地图下载模式 | 否 |
| mapStyle（地图样式）  | default:默认样式，其他自定义（需开发） | 否 |
| wg（样式控制）  | 任意，一般 为1 | 否 |

# 三、二次开发说明
##  1、 应用创建
1. 注册百度账号，登录百度开放平台  http://lbsyun.baidu.com/
2. 进入：控制台-应用管理-我的应用-创建应用-访问应用（AK）
3. 复制AK到代码中，修改index.html中   myak的值

## 2. 皮肤开发
1. 登录百度开放平台-开发文档-个性化地图编辑器
2. 开发编辑地图吧
3. 复制编辑好的样式ID ，放入js/wy/ctrlThemes.js 代码中
```
var THEMES=[
		{
			name:"default",
			styleId:"151ee65711668a3dd5ae28ee4fb1115e",
			label:"常规"
		},
		{
			name:"wenzhonghuang",
			styleId:"f56fdf2d772cd6f103bdf3878a45f37b",
			label:"稳重黄"
		}
	];
```

## 3、地图开发
> 百度地图开放平台中API完全可用，自行学习吧

* jsAPI：http://lbsyun.baidu.com/index.php?title=jspopular3.0
* demo：http://lbsyun.baidu.com/jsdemo.htm#canvaslayer
* mapV：https://mapv.baidu.com/

## 4、代码说明
> 代码路径介绍

1. com.zliv.controller.BDController :后台控制器，gis的数据查询及保存控制器
2. webapp/js : gis破解文件路径
3. webapp/js/wy : 业务文件路径 （ctrl.js 操作面板控制器;  ctrlThemes.js 主题控制器;    ）
4. index.html ：  GIS主页面

## 5、离线发布

* 运行在：jdk8/tomcat9 下  ，war包
* 将自动/手动下载的离线矢量瓦片信息（在项目运行路径：webapp\map\stylejs）复制到发布包的指定目录下（webapp\map\stylejs），即可实现离线使用。

# 注：示例中提供的AK和styleId 均为我测试环境,开发时请自行注册百度账号，创建应用及样式。
技术支持：453826286@qq.com
