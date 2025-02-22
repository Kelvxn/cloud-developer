import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // TODO: Implement creating a new TODO item
    
    const userId = getUserId(event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const newItem = await createTodo(newTodo, userId)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
       Item: newItem
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
