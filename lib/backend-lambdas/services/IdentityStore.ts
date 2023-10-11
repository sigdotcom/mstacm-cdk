import {
  IdentitystoreClient,
  UpdateUserCommand,
  CreateUserCommand,
  DeleteUserCommand,
} from "@aws-sdk/client-identitystore";

class IdentityStoreService {
  private client: IdentitystoreClient;
  private identityStoreId: string;

  constructor() {
    this.client = new IdentitystoreClient({});
    this.identityStoreId = "d-9067aafb7a";
  }

  async updateAWSUserPermissions(
    identityId: string,
    attributePath: string,
    attributeValue: any
  ) {
    const input = {
      IdentityStoreId: this.identityStoreId,
      UserId: identityId,
      Operations: [
        {
          AttributePath: attributePath,
          AttributeValue: attributeValue,
        },
      ],
    };

    try {
      const command = new UpdateUserCommand(input);
      return await this.client.send(command);
    } catch (error) {
      console.error("Error updating user permissions:", error);
      throw error;
    }
  }

  async createUser(firstName: string, lastName: string, email: string) {
    const input = {
      IdentityStoreId: this.identityStoreId,
      UserName: email,
      Name: {
        FamilyName: lastName,
        GivenName: firstName,
        Formatted: `${firstName} ${lastName}`,
      },
      DisplayName: `${firstName} ${lastName}`,
      Emails: [
        {
          Primary: true,
          Type: "personal",
          Value: email,
        },
      ],
    };
    try {
      const command = new CreateUserCommand(input);
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async deleteUser(identityId: string) {
    const input = {
      IdentityStoreId: this.identityStoreId,
      UserId: identityId,
    };

    try {
      const command = new DeleteUserCommand(input);
      return await this.client.send(command);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
}

export default IdentityStoreService;
