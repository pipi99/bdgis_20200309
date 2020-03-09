package com.zliv.util;

import com.alibaba.fastjson.JSON;
import org.springframework.core.io.ClassPathResource;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.zip.GZIPOutputStream;

public class GisUtil {
	/**
	 * 毫秒数格式化输出
	 * @param ms
	 * @return
	 */
	public static String formatTime(Long ms) {  
	    Integer ss = 1000;  
	    Integer mi = ss * 60;  
	    Integer hh = mi * 60;  
	    Integer dd = hh * 24;  

	    Long day = ms / dd;  
	    Long hour = (ms - day * dd) / hh;  
	    Long minute = (ms - day * dd - hour * hh) / mi;  
	    Long second = (ms - day * dd - hour * hh - minute * mi) / ss;  
	    Long milliSecond = ms - day * dd - hour * hh - minute * mi - second * ss;  

	    StringBuffer sb = new StringBuffer();  
	    if(day > 0) {  
	        sb.append(day+"天");  
	    }  
	    if(hour > 0) {  
	        sb.append(hour+"小时");  
	    }  
	    if(minute > 0) {  
	        sb.append(minute+"分钟");  
	    }  
	    if(second > 0) {  
	        sb.append(second+"秒");  
	    }  
	    if(milliSecond > 0) {  
	        sb.append(milliSecond+"毫秒");  
	    }  
	    return sb.toString();  
	}
	
	/**
	 * 压缩结果输出
	 * @param response
	 * @return
	 */
	public static void gzipJSONOutStream(Object object, HttpServletResponse response) {
		ByteArrayOutputStream bout = new ByteArrayOutputStream();
        GZIPOutputStream gout;
		try {
			String jsonStr = JSON.toJSONString(object);
			gout = new GZIPOutputStream(bout);
			gout.write(jsonStr.getBytes("UTF-8"));
			gout.close();
		} catch (IOException e1) {
			e1.printStackTrace();
		}
		// 得到压缩后的数据
        byte g[] = bout.toByteArray();
        
        response.setHeader("Content-Encoding", "gzip");
        try {
			response.getOutputStream().write(g);
		} catch (IOException e1) {
			e1.printStackTrace();
		}
	}
	
	
	/**
	 * 压缩结果输出
	 * @param response
	 * @return
	 */
	public static void gzipFileOutStream(File f, HttpServletResponse response ) {
	
		FileInputStream in = null;
		ByteArrayOutputStream bout = new ByteArrayOutputStream();
        GZIPOutputStream gout = null;
		try {
			gout = new GZIPOutputStream(bout);
			in = new FileInputStream(f);
            byte[] buffer = new byte[1024];
            int len = 0;
            while ((len = in.read(buffer)) != -1) {
            	gout.write(buffer, 0, len);
            }
			gout.close();
		} catch (IOException e1) {
			e1.printStackTrace();
		}finally{
			try {
				in.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
			
		}
		// 得到压缩后的数据
        byte g[] = bout.toByteArray();
        
        response.setHeader("Content-Encoding", "gzip");
        try {
			response.getOutputStream().write(g);
		} catch (IOException e1) {
			e1.printStackTrace();
		}
	}
	
	
	/**
     * get请求
     * 
     * @param url
     * @param f
     * @return
     */
    public static void get(String url,File f) {
    	 InputStream inStrm = null;
         FileOutputStream fos = null;
         try {
         	f.createNewFile();
         	fos = new FileOutputStream(f);
            URL restServiceURL = new URL(url);
            HttpURLConnection httpConnection = (HttpURLConnection) restServiceURL.openConnection();
            httpConnection.setRequestMethod("GET");
//            httpConnection.setRequestProperty("Accept", "application/json");
            if (httpConnection.getResponseCode() != 200) {
	                throw new RuntimeException("HTTP GET Request Failed with Error code : "
	                              + httpConnection.getResponseCode()+"   "+f.getName());
            }
	        inStrm = httpConnection.getInputStream();
	        byte []b=new byte[1024];
	        int length=-1;
	        while((length=inStrm.read(b))!=-1){
	        	fos.write(b, 0, length);
	        }
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }finally {
        	try {
				if(inStrm!=null) {
					inStrm.close();
				}
				if(fos!=null) {
					fos.close();
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }
    }
    /**
     * post    请求
     * 
     * @param url
     * @param f
     * @return
     */
    public static void post(String url,File f) {
        InputStream inStrm = null;
        FileOutputStream fos = null;
        try {
        	fos = new FileOutputStream(f);
            URL restServiceURL = new URL(url);
            HttpURLConnection httpConnection = (HttpURLConnection) restServiceURL.openConnection();
            httpConnection.setRequestMethod("POST");
            httpConnection.setRequestProperty("Accept", "application/json");
            // 设置是否从httpUrlConnection读入，默认情况下是true;    
            httpConnection.setDoInput(true);    
            // Post 请求不能使用缓存    
            httpConnection.setUseCaches(false); 
            if (httpConnection.getResponseCode() != 200) {
                throw new RuntimeException("HTTP POST Request Failed with Error code : "
                              + httpConnection.getResponseCode());
            }
            inStrm = httpConnection.getInputStream();
            byte []b=new byte[1024];
            int length=-1;
            while((length=inStrm.read(b))!=-1){
            	fos.write(b, 0, length);
            }
        }  catch (IOException e) {
            e.printStackTrace();
        }finally {
        	try {
				if(inStrm!=null) {
					inStrm.close();
				}
				if(fos!=null) {
					fos.close();
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }
    }

    public static File getResourceFile(String filename){
		ClassPathResource resource = new ClassPathResource("/META-INF/resources/"+filename);
		try {
//			System.out.println(resource.getURL());
			return resource.getFile();
		} catch (IOException e) {
//			e.printStackTrace();
		}
		return null;
	}

	public static String getResourcePath(){
		ClassPathResource resource = new ClassPathResource("/META-INF/resources/");
		try {
//			System.out.println(resource.getURL().getPath());
			return resource.getURL().getPath();
		} catch (IOException e) {
//			e.printStackTrace();
		}
		return null;
	}
}
