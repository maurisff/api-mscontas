# API-MSCONTAS

> API para gestão de Contas de Pequenos Negócios, utilizando as tecnologias Node.JS, Express.JS e MongoDB.

## Build Setup

``` bash
#Create an .env File
#For Windows
copy NUL .env 
#For Linux
touch .env 

#Add the environment variables needed to boot the server into the .env file:
JWT_SECRETKEY=1234567890
MONGO_DB=mongodb://localhost:27017/db-api
AUTENTICATION=true
HTTPLOG=false

# install dependencies
npm install

# serve with hot reload at localhost:4000
npm run dev

# build for production with minification
npm run start
