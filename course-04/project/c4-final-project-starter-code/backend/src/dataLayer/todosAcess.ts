import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';


const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
    ) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: '#userId = :userId',
            ExpressionAttributeNames: {
              "#userId": "userId"
            },
            ExpressionAttributeValues: {
              ':userId': userId
            },
            ScanIndexForward: false
        }).promise()
      
        const todos = result.Items

        return todos as TodoItem[];

    }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {

    const result = await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem
      }).promise();

    console.log(result)

    logger.info("Todo successfully created.", todoItem)
    return todoItem as TodoItem;
  }

  async updateTodoItem(userId: string, todoId: string, updatedTodo: TodoUpdate) {
    const result = await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'SET #n = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues : {
          ':name': updatedTodo.name,
          ':dueDate': updatedTodo.dueDate,
          ':done': updatedTodo.done
        },
        ExpressionAttributeNames: {
          '#n': 'name'
        }
      }).promise();

    const attributes = result.Attributes;

    logger.info("Todo has been updated successfully.")
    return attributes as TodoUpdate;
  }

  async deleteTodoItem(userId: string, todoId: string) {
    await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      }).promise();

    logger.info("Todo has been deleted successfully.")
  }
 

}
