import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoIdp = new CognitoIdentityProviderClient({ region: "us-east-1" }); // replace 'us-east-1' with your region if different

const handler = async (event: any) => {
  const params = {
    UserAttributes: [
      {
        Name: "custom:role",
        Value: "member",
      },
    ],
    UserPoolId: event.userPoolId,
    Username: event.userName,
  };

  try {
    // Make the call to update user attributes
    const command = new AdminUpdateUserAttributesCommand(params);
    await cognitoIdp.send(command);
  } catch (err) {
    console.error("Error updating user attributes:", err);
    throw err; // You might want to handle this more gracefully depending on your use case.
  }

  // Return the original event (or modify as necessary)
  return event;
};

export { handler };
