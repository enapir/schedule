FROM nginx:latest

RUN mkdir -p /schedule
RUN mkdir -p /var/run/nginx
WORKDIR /schedule

EXPOSE 80

#默认配置文件
COPY nginx.conf /etc/nginx
COPY dist /schedule

RUN  ls /schedule
