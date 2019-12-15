# OpenBadges


## GitHub Repository
[OpenBadges](https://github.com/dhenn12/OpenBadges)


## Getting Started

1. [Download](https://github.com/dhenn12/OpenBadges/archive/master.zip) or clone the GitHub Repository
``git clone https://github.com/dhenn12/OpenBadges``


## Starting with Docker:

1. install Docker on your local machine
2. open shell and navigate to folder ``OpenBadges``
3. run ``docker-compose up``
4. open  [192.168.99.100:3000](http://192.168.99.100:3000/)


## Starting without Docker:
1. install [Node.js v10.xx](https://nodejs.org/en/) and [MongoDB v4.xx](https://www.mongodb.com/download-center/community?) on your local machine
2. open shell and create MongoDB
   * on Windows: ``"C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath="C:\path_to_OpenBadges\data"``
3. open another shell and navigate to folder ``api``
   ```
   OpenBadges
    └── api
   ```

 * run ``npm install``
 * run ``npm start``
4. open another shell and navigate to folder ``app``
   ```
   OpenBadges
   └── app
   ```

 * run ``npm install``
 * run ``npm start``
5. open  [localhost:3000](http://localhost:3000)



## Credentials
   | username  | password |
   | --------- | -------- |
   | admin     | admin123 |
   

## Authors
* Dorian
* Luc
