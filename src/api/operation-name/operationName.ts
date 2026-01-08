import type { Verbs } from "@orval/core";
import type { OperationObject } from "openapi3-ts/oas30";
import pluralize from "pluralize";

/**
 * Generate clean operation names from Redfish API routes.
 *
 * Note: Orval transforms route params before passing to this function:
 *   OpenAPI format: /path/{ParamName}
 *   Orval passes:   /path/${paramName}  (adds $, converts to camelCase)
 *
 * Transforms routes like:
 *   /redfish/v1/AccountService/Accounts/${managerAccountId}/Certificates/${certificateId}
 * Into operation names like:
 *   getAccountServiceAccountCertificateById
 */
export const operationName = (
  operation: OperationObject,
  route: string,
  verb: Verbs,
) => {
  // Note: Orval transforms route params before passing to this function:
  //   OpenAPI format: /path/{ParamName}
  //   Orval passes:   /path/${paramName}  (adds $, converts to camelCase)
  // So we must match ${param} format, not {Param} format.

  let myRoute: string = route.replace(/^(\/redfish\/v1(\/?))$/, "ServiceRoot");

  // Remove the beginning of the path "/redfish/v1" from route
  myRoute = myRoute.replace(/^(\/redfish\/v1\/)(?!$)/, "");

  // Remove "/Actions" from the route and extract action name
  myRoute = myRoute.replace(
    /(\/Actions\/)([\w\d]*)\.*([\w\d]+)$/,
    (match, p1, p2, p3, offset) => `/${p3}`,
  );

  // Remove path variable at end of path, fix plural language for preceding operation name
  // Ex: "AccountService/Accounts/${managerAccountId}/Certificates/${certificateId}"
  //  => "AccountService/Accounts/${managerAccountId}/Certificate/ById"
  if (myRoute.match(/(\/\${[\w\d]+})$/)) {
    myRoute = myRoute.replace(/(\/\${[\w\d]+})$/, "/ById");
    // Remove previous plural
    myRoute = myRoute.replace(
      /(\/([\w\d]+)\/ById$)/,
      (match, p1, p2, offset) => "/" + pluralize.singular(p2) + "/ById",
    );
  }

  let opName = "" + myRoute;

  // Remove all path params, replace preceding plural resource name with singular name
  // "AccountService/Accounts/${managerAccountId}/Certificate/ById"
  //  => "AccountService/Account/Certificate/ById"
  const myRe = /(^|\/)([\w\d]+)(\/\${[\w\d]+})/g;
  let myArray;
  while ((myArray = myRe.exec(myRoute)) !== null) {
    const singular = pluralize.singular(myArray[2]);
    if (singular !== myArray[2]) opName = opName.replace(myArray[2], singular);
    opName = opName.replace(myArray[3], "");
    --myRe.lastIndex;
  }

  // Remove all non-alphanumeric characters to create valid JavaScript identifier
  opName = opName.replace(/[^a-zA-Z0-9]/g, "");

  return verb + opName;
};
