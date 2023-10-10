import {
  DynamoDBClient,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

class DynamoDBService {
  private dynamoDb: DynamoDBClient;
  private tableName: string;

  constructor(tableName: string) {
    this.dynamoDb = new DynamoDBClient();
    this.tableName = tableName;
  }

  async updateRole(id: string, role: string) {
    const input = {
      Key: {
        userId: {
          S: id,
        },
      },
      UpdateExpression: "SET #roleAttribute = :r",
      ExpressionAttributeNames: {
        "#roleAttribute": "role",
      },
      ExpressionAttributeValues: {
        ":r": {
          S: role,
        },
      },
      TableName: this.tableName,
    };

    try {
      const command = new UpdateItemCommand(input);
      const response = await this.dynamoDb.send(command);
      return response;
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  }

  async scan() {
    const input = {
      TableName: this.tableName,
    };

    const command = new ScanCommand(input);
    const response = await this.dynamoDb.send(command);
    return response.Items;
  }
}

export default DynamoDBService;
