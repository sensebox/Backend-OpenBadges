# OpenBadges - Backend

This [repository](https://github.com/sensebox/Backend-OpenBadges) contains the backend of OpenBadges and forms the counterpart to the [frontend](https://github.com/sensebox/Frontend-OpenBadges) of OpenBadges.


## Getting Started

1. [Download](https://github.com/sensebox/Backend-OpenBadges/archive/master.zip) or clone the GitHub Repository ``git clone https://github.com/sensebox/Backend-OpenBadges`` and checkout to branch ``master``.


## Starting with Docker:

1. install Docker on your local machine
2. open shell and navigate to folder ``Backend-OpenBadges``
3. run ``docker-compose up``
4. open [192.168.99.100:3001](http://192.168.99.100:3001/docs) respectively your individual domain (e.g. [localhost:3001](http://localhost:3001/docs))


## Starting without Docker:
1. install [Node.js v10.xx](https://nodejs.org/en/) and [MongoDB v4.xx](https://www.mongodb.com/download-center/community?) on your local machine
2. open shell and create MongoDB
   * on Windows: ``"C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath="C:\path\to\Backend-OpenBadges\data"``
3. open another shell and navigate inside folder ``Backend-OpenBadges``
    * run ``npm install``
    * run ``npm start``
5. open  [localhost:3001](http://localhost:3001/docs)



## Demo
1. open shell and navigate to MongoDB (for windows: `C:\Program Files\MongoDB\Server\4.2\bin`)
2. import the demo data (e.g. users)
    * run `mongoimport --db=openBadges --collection=users --file=\path\to\Backend-OpenBadges\demo\users.json`
    * [further information](https://docs.mongodb.com/manual/reference/program/mongoimport/)

   #### Credentials
      | username  | password |
      | --------- | -------- |
      | barto     | 123456   |
      | mario     | 123456   |
      | delucse   | 123456   |


## API-Documentation
The generated HTML page of the current API documentation are located in [``doc``](../master/api/doc) and can be accessed in the browser at [https://sensebox.github.io/Backend-OpenBadges](https://sensebox.github.io/Backend-OpenBadges) or local at [localhost:3001/docs](http://localhost:3001/docs/) respectively [192.168.99.100:3001/docs](http://192.168.99.100:3001/docs/).
