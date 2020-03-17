# OpenBadges


## GitHub Repository
[OpenBadges](https://github.com/dhenn12/OpenBadges)


## Getting Started

1. [Download](https://github.com/dhenn12/OpenBadges/archive/master.zip) or clone the GitHub Repository ``git clone https://github.com/dhenn12/OpenBadges`` and checkout to branch ``master``.


## Starting with Docker:

1. install Docker on your local machine
2. open shell and navigate to folder ``OpenBadges``
3. ensure that the correct API domain is used in lines 11 and 19 of docker-compose.yml (default: http://192.168.99.100:3001)
   ```
   OpenBadges
    └── docker-compose.yml
   ```
4. run ``docker-compose up``
5. open [192.168.99.100:3000](http://192.168.99.100:3000/) respectively your individual domain (e.g. [localhost:3000](http://localhost:3000))


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



## Demo 
1. open shell and navigate to MongoDB (for windows: `C:\Program Files\MongoDB\Server\4.2\bin`)
2. import the demo data (e.g. users)
    * run `mongoimport --db=openBadges --collection=users --file=\path\to\api\demo\users.json`
    * [further information](https://docs.mongodb.com/manual/reference/program/mongoimport/)

   #### Troubleshoot
   ensure that some "enddate" in courses.json are in the future to experience all functionalities of the application
   ```
   OpenBadges
   └── api
       └── demo
           └── courses.json
   ```
   
   #### Credentials
      | username  | password |
      | --------- | -------- |
      | admin     | admin123 |
      | d_hen06   | 1234567  |
      | h.k98     | 1234567  |
      | l_nisk01  | 1234567  |
      | m_ster15  | 1234567  |
      | s_buse01  | 1234567  |
   


## API
The generated HTML page of the current API documentation are located in [``doc``](../master/api/doc) and can be accessed in the browser at [https://dhenn12.github.io/OpenBadges/api/doc/index.html](https://dhenn12.github.io/OpenBadges/api/doc/index.html) or local at [localhost:3001/docs](http://localhost:3001/docs/) respectively [192.168.99.100:3001/docs](http://192.168.99.100:3001/docs/).


## Authors
* Dorian
* Hilal
* Marius
* Luc
* Sven
