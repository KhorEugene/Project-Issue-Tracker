/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});


module.exports = function (app) {
  
  app.route('/api/issues/:project')
    
    .get(function (req, res){
      var project = req.params.project;
      MongoClient.connect(CONNECTION_STRING,(err,db)=>{
      if(err){
        console.log('Database error: '+err); 
      } else {
        console.log('Successful database connection'); 
        const dbc = db.db('test').collection(project); //database within cluster
        dbc.find(req.query).toArray(function(err,data){
          res.send(data);
          console.log('Successful retrieval of data from '+project);
        });
      }
      })
      console.log('successful get');
    })
    
    .post(function (req, res){
      var project = req.params.project;
    const date = new Date();
    const issue = {
      'issue_title':req.body.issue_title,
      'issue_text':req.body.issue_text,
      'created_on':date,
      'updated_on':date,
      'created_by':req.body.created_by,
      'assigned_to':req.body.assigned_to,
      'open':'true',
      'status_text':req.body.status_text
    }
    MongoClient.connect(CONNECTION_STRING,(err,db)=>{
      if(err){
        console.log('Database error: '+err); 
      } else {
        console.log('Successful database connection'); 
        const dbc = db.db('test').collection(project); //database within cluster
        dbc.insertOne(issue,function(err,isu){
          if(err){
            return console.log('Error in inserting issue');
          }
          console.log('Successfully added issue');
          res.json(issue);
        });
      }
    })
    console.log('Successful post');
    })
    
    .put(function (req, res){
      var project = req.params.project;
      const id=req.body._id;
      if(id==''){
        return res.send('No updated fields sent');
      } else if(id.length!=24){
       return res.send('Could not update '+id); 
      }
      const title = req.body.issue_title;
      const text = req.body.issue_text;
      const created = req.body.created_by;
      const assigned = req.body.assigned_to;
      const status = req.body.status_text;
      const date = new Date();
      const open  = req.body.open;
      MongoClient.connect(CONNECTION_STRING,(err,db)=>{
        if(err){
          console.log('Database error: '+err); 
        } else {
          console.log('Successful database connection'); 
          const dbc = db.db('test').collection(project); //database within cluster
          dbc.findOne({_id:ObjectId(id)},function(err,isu){
            if(err){
              res.end();
              return console.log('Error in finding issue');
            }
            if(isu == null){
              res.send('Could not update '+id);
              return console.log('Cannot find issue');
            } else {
              console.log('Successfully found issue');
              if(title!=''&&title!=undefined){
                isu.issue_title = title;
              }
              if(text!=''&&text!=undefined){
                isu.issue_text = text;
              }
              if(created!=''&&created!=undefined){
                isu.created_by = created;
              }
              if(assigned!=''&&assigned!=undefined){
                isu.assigned_to = assigned;
              }
              if(status!=''&&status!=undefined){
                isu.status_text = status;
              }
              if(open!=undefined){
                isu.open = 'false';
              }
              isu.updated_on=date;
              dbc.update({_id:ObjectId(id)},isu,{upsert:true});
              console.log('Issue updated successfully');
              res.send('Successfully updated.')
            }
          })
        }
      })
      console.log('Successful put');
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      const id=req.body._id;
      if(id==''){
          return res.send('_id error');
        } else if(id.length!=24){
         return res.send('Could not delete '+id); 
        }
      MongoClient.connect(CONNECTION_STRING,(err,db)=>{
        if(err){
          console.log('Database error: '+err); 
        } else {
          console.log('Successful database connection');  
          const dbc = db.db('test').collection(project); //database within cluster. Collection is named test
          dbc.remove({_id:ObjectId(id)},{justOne:true},function(err,data){
            if(err){
              res.end();
              return console.log('Deletion unsuccessful');
            }
            if(data.result.n==0){
              res.send('Could not delete '+id)
              return console.log('Deletion unsuccessful');
            } else {
            res.send('Deleted ' +id);
            return console.log('Deletion successful');
            }
          });
        }
      })
      console.log('Successful delete');
    });
    
};
