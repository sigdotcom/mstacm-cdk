import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

class DynamoDBService {
  private dynamoDb: DynamoDBClient;
  private tableName: string;

  constructor(tableName: string) {
    this.dynamoDb = new DynamoDBClient();
    this.tableName = tableName;
  }

  /**
   * Put an item into the table.
   * @param item The item to put.
   * @returns Promise with the put result.
   */
  async putItem(id: string) {
    const input = {
      Item: {
        id: {
          S: id,
        },
        Test2: {
          S: "No One You Know",
        },
        Test3: {
          S: "Call Me Today",
        },
      },
      ReturnConsumedCapacity: "TOTAL",
      TableName: this.tableName,
    };

    const command = new PutItemCommand(input);
    const response = await this.dynamoDb.send(command);
  }

  /**
   * Get an item from the table.
   * @param key The primary key of the item.
   * @returns Promise with the retrieved item.
   */
  async getItem(id: string) {
    const input = {
      Key: {
        id: {
          S: id,
        },
      },
      TableName: this.tableName,
    };

    const command = new GetItemCommand(input);
    const response = await this.dynamoDb.send(command);
    return response;
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
