package com.zliv;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class ZLiV_bdgis_10010 extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(ZLiV_bdgis_10010.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(ZLiV_bdgis_10010.class);
    }
}
