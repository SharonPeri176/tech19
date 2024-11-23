from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource, Api, reqparse, fields, marshal_with, abort
app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello world'


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app) 
api = Api(app)

class TaskModel(db.Model): 
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(200), unique=True, nullable=False)
    completed= db.Column(db.Boolean, nullable=False)

task_args = reqparse.RequestParser()
task_args.add_argument('title', type=str, required=True, help="Title cannot be blank")
task_args.add_argument('description', type=str, required=True, help="Description cannot be blank")
task_args.add_argument('completed', type=bool, required=True, help="Completed must be true or false")

taskFields = {
    'id': fields.Integer,
    'title': fields.String,
    'description': fields.String,
    'completed': fields.Boolean
}


class Tasks(Resource):
    @marshal_with(taskFields)
    def get(self):
        tasks = TaskModel.query.all() 
        return tasks 
    
    @marshal_with(taskFields)
    def post(self):
        args = task_args.parse_args()
        task = TaskModel(title=args["title"], description=args["description"], completed=args["completed"])
        db.session.add(task) 
        db.session.commit()
        tasks = TaskModel.query.all()
        return tasks, 201
    
class Task(Resource):
    @marshal_with(taskFields)
    def get(self, id):
        task = TaskModel.query.filter_by(id=id).first() 
        if not task: 
            abort(404, message="Task not found")
        return task 
    
    @marshal_with(taskFields)
    def put(self, id):
        args = task_args.parse_args()
        task = TaskModel.query.filter_by(id=id).first() 
        if not task: 
            abort(404, message="Task not found")
        task.title = args["title"]
        task.description = args["description"]
        task.completed = args["completed"]
        db.session.commit()
        return task 
    
    @marshal_with(taskFields)
    def delete(self, id):
        task = TaskModel.query.filter_by(id=id).first() 
        if not task: 
            abort(404, message="Task not found")
        db.session.delete(task)
        db.session.commit()
        tasks = TaskModel.query.all()
        return tasks
    
api.add_resource(Tasks, '/tasks/')
api.add_resource(Task, '/tasks/<int:id>')


if __name__ == '__main__':
    app.run(debug=True)