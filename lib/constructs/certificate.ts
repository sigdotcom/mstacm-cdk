import { StackProps } from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";

export interface CertificateConstructProps extends StackProps {
  rootDomain: string;
}

export default class CertificateConstruct extends Construct {
  private readonly mstacmAmplifyCertificate: Certificate;

  constructor(scope: Construct, id: string, props: CertificateConstructProps) {
    super(scope, id);

    this.mstacmAmplifyCertificate = new Certificate(
      this,
      "MstacmAmplifyCertificate",
      {
        domainName: props.rootDomain,
        validation: CertificateValidation.fromDns(), // This will use DNS validation for the certificate
        subjectAlternativeNames: [`*.${props.rootDomain}`], // This will cover subdomains
      }
    );
  }

  public get amplifyCertificate(): Certificate {
    return this.mstacmAmplifyCertificate;
  }
}
