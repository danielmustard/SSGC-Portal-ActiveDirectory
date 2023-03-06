##Node alpine for handling VITE build into static production code
FROM node:18-alpine3.17 as build

WORKDIR /app

COPY . /app

ARG VITE_APPLICATION_ID
ARG VITE_TENANT_ID
ARG VITE_API_SCOPE

#Adding docker enviroment variables into .env file, had to do it this way because vite is unable to access process.env values directly
RUN printf "VITE_APPLICATION_ID=%s\n" "${VITE_APPLICATION_ID}" >> .env && \
    printf "VITE_TENANT_ID=%s\n" "${VITE_TENANT_ID}" >> .env && \
    printf "VITE_API_SCOPE=%s\n" "${VITE_API_SCOPE}" >> .env

##Install required node packages
RUN npm install


##Build app into static production code
RUN npm run build

##Second stage of Frontend, NGIX used to serve static content
FROM ubuntu
RUN apt-get update
RUN apt-get install nginx -y

COPY --from=build /app/dist /var/www/html/
COPY --from=build /app/ngix_config /var/www/
COPY --from=build /app/.env /var/www/


EXPOSE 443
CMD ["nginx","-g","daemon off;","-c","/var/www/ngix_config.conf"]
