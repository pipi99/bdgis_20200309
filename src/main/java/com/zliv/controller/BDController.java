package com.zliv.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.zliv.util.GisUtil;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.MalformedURLException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;



/**
 * @Description: 执行bdGiS 瓦片下载与查询
 * @Author: LiV
 * @Date: 2020.3.6 16:02
 **/
@RestController
@RequestMapping(value = "/livGis")
public class BDController {
    /**
     * 下载图片
     * @param name
     * @param httpurl
     * @param request
     * @return
     */
    @RequestMapping("/downloadGisPng")
    public String  downloadGisPng(String name, String httpurl, HttpServletRequest request) {
        String dir =  "map/mapImages/"+(name.substring(0, name.lastIndexOf("/"))).replaceAll("/", Matcher.quoteReplacement(File.separator));
        File f = GisUtil.getResourceFile(dir);
        if(f==null||!f.exists()){
            f = new File(GisUtil.getResourcePath()+dir);
            f.mkdirs();
        }
        f = GisUtil.getResourceFile("map/mapImages/"+name);
        if(f==null||!f.exists()||f.length()==0){
            f = new File(GisUtil.getResourcePath()+"map/mapImages/"+name);
            System.out.println(new Date()+"下载："+name);
            GisUtil.get(httpurl, f);
        }
        return "success";
    }

    /**
     * 下载样式瓦片
     * @param name
     * @param httpurl
     * @param request
     * @return
     */
    @RequestMapping("/downloadGisStyle")
    public String  downloadGisStyle(String name, String httpurl, HttpServletRequest request) {

        String dir =  "map/stylejs/"+(name.substring(0, name.lastIndexOf("/"))).replaceAll("/", Matcher.quoteReplacement(File.separator));

        File f = GisUtil.getResourceFile(dir);
        if(f==null||!f.exists()){
            f = new File(GisUtil.getResourcePath()+dir);
            f.mkdirs();
        }
        f = GisUtil.getResourceFile("map/stylejs/"+name);
        if(f==null||!f.exists()||f.length()==0){
            f = new File(GisUtil.getResourcePath()+"map/stylejs/"+name);
            System.out.println(new Date()+"下载："+name);
            GisUtil.get(httpurl, f);
        }
        return "success";
    }

    /**
     * 查询GIS图片
     * @param name
     * @param request
     * @return
     */
    @RequestMapping("/findGisPng")
    public void  findGisPng(String name,  HttpServletRequest request, HttpServletResponse response) {

        File f = GisUtil.getResourceFile("map/mapImages/"+name);
        if(f!=null&&f.exists()){
            GisUtil.gzipFileOutStream(f,response);
        }
    }

    /**
     * 查询样式瓦片
     * @param name
     * @param request
     * @return
     */
    @RequestMapping("/findGisStyle")
    public void  findGisStyle(String name,  HttpServletRequest request, HttpServletResponse response) {

        File f = GisUtil.getResourceFile("map/stylejs/"+name);
        if(f!=null&&f.exists()){
            GisUtil.gzipFileOutStream(f,response);
        }
    }

    /**
     * 查询表格数据
     * @param request
     * @return
     */
    @RequestMapping("/findData")
    public void  findData( HttpServletRequest request, HttpServletResponse response) {
        File f = GisUtil.getResourceFile("datas/myLines.txt");
        if(f!=null&&f.exists()){
            GisUtil.gzipFileOutStream(f,response);
        }
    }

    /**
     * 保存表格数据
     * @param request
     * @return
     */
    @RequestMapping("/saveData")
    public String  saveData(String datas, HttpServletRequest request, HttpServletResponse response) {

        String basePath = request.getServletContext().getRealPath(File.separator)+File.separator+ "datas" +File.separator+"myLines.txt";
        File  f = new File(basePath);
        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(f);
            fos.write(datas.getBytes("UTF-8"));
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }finally {
            try {
                if(fos!=null) {
                    fos.close();
                }
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        return "success";
    }

    /**
     * 查询路径坐标
     * @param request
     * @return
     */
    @RequestMapping("/findRoadPoints")
    public Map findRoadPoints(String points, HttpServletRequest request, HttpServletResponse response) {
        Map result = null;
        String[] parr = points.split(",");
        for(int i=0;i<parr.length;i+=2){
            String filename = addO(parr[i+1])+","+addO(parr[i]);
            if(i+3<parr.length){
                filename+=","+addO(parr[i+3])+","+addO(parr[i+2]);
                filename = "driving"+filename;

                Map m = getFileContent( filename, request);
                if(result!=null){
                    String path = result.get("path")+";"+m.get("path");
                    int distance = Integer.parseInt(result.get("distance")+"")+Integer.parseInt(m.get("distance")+""); // 距离 单位为米
                    int duration = Integer.parseInt(result.get("duration")+"")+Integer.parseInt(m.get("duration")+"");;  // 时常 单位为秒

                    result.put("distance",distance);
                    result.put("duration",duration);
                    result.put("path",path);
                }else{
                    result = m;
                }
            }
        }
        return  result;
    }

    /**
     * 补足小数点后数字位数
     * @param p
     * @return
     */
    private String addO(String p){
        String[] arr = p.split("\\.");
        String arr1 = arr[1];
        for(int i=0;i<6-arr[1].length();i++){
            arr1+="0";
        }
        return arr[0]+"."+arr1;
    }
    private Map getFileContent(String filename, HttpServletRequest request){
        String basePath = request.getServletContext().getRealPath(File.separator)+File.separator+ "datas" +File.separator;
        File f = new File(basePath+filename);
        String result = "";
        if(f.exists()){
            BufferedReader br = null;
            try {
                br = new BufferedReader(new InputStreamReader(new FileInputStream(f)));
                String line = null;
                while ((line = br.readLine())!=null){
                    result += line;
                }
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }finally {
                if(br!=null){
                    try {
                        br.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    ;
                }
            }

            result = result.substring(result.indexOf("(")+1,result.length()-1);

            JSONObject jsonObject = JSON.parseObject(result);
            jsonObject = jsonObject.getJSONObject("content").getJSONObject("result").getJSONArray("routes").getJSONObject(0);
            int distance = jsonObject.getIntValue("distance"); // 距离 单位为米
            int duration = jsonObject.getIntValue("duration");  // 时常 单位为秒
            JSONArray array = jsonObject.getJSONArray("steps");

            StringBuffer sb = new StringBuffer();
            for(int i=0;i<array.size();i++){
                JSONObject o = array.getJSONObject(i);
                if(sb.length()>0){
                    sb.append(";");
                }
                sb.append(o.getString("path"));
            }
            String path = sb.toString();

            Map m = new HashMap();
            m.put("distance",distance);
            m.put("duration",duration);
            m.put("path",path);
            return m;
        }
        return null;
    }

    /**
     * 保存路径坐标
     * @param request
     * @return
     */
    @RequestMapping("/saveRoadPoints")
    public String  saveRoadPoints( String name,String httpurl,HttpServletRequest request, HttpServletResponse response) {
        String basePath = request.getServletContext().getRealPath(File.separator)+File.separator+ "datas" +File.separator;
        File f = new File(basePath+name);
        if(!f.exists()||f.length()==0){
            System.out.println(new Date()+"下载："+name);
            GisUtil.get(httpurl, f);
        }
        return "success";
    }
}
