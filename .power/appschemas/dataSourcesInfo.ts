/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is auto-generated. Do not modify it manually.
 * Changes to this file may be overwritten.
 */

export const dataSourcesInfo = {
  "office365users": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "apis": {
      "UpdateMyProfile": {
        "path": "/{connectionId}/codeless/v1.0/me",
        "method": "PATCH",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ]
      },
      "MyProfile_V2": {
        "path": "/{connectionId}/codeless/v1.0/me",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ]
      },
      "UpdateMyPhoto": {
        "path": "/{connectionId}/codeless/v1.0/me/photo/$value",
        "method": "PUT",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "Content-Type",
            "in": "header",
            "required": true,
            "type": "string"
          }
        ]
      },
      "MyTrendingDocuments": {
        "path": "/{connectionId}/codeless/beta/me/insights/trending",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$filter",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "extractSensitivityLabel",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "fetchSensitivityLabelMetadata",
            "in": "query",
            "required": false,
            "type": "boolean"
          }
        ]
      },
      "RelevantPeople": {
        "path": "/{connectionId}/users/{userId}/relevantpeople",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ]
      },
      "MyProfile": {
        "path": "/{connectionId}/users/me",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ]
      },
      "UserProfile": {
        "path": "/{connectionId}/users/{userId}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ]
      },
      "UserPhotoMetadata": {
        "path": "/{connectionId}/users/photo",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ]
      },
      "UserPhoto": {
        "path": "/{connectionId}/users/photo/value",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ]
      },
      "Manager": {
        "path": "/{connectionId}/users/{userId}/manager",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ]
      },
      "DirectReports": {
        "path": "/{connectionId}/users/{userId}/directReports",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ]
      },
      "SearchUser": {
        "path": "/{connectionId}/users",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "searchTerm",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "top",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ]
      },
      "SearchUserV2": {
        "path": "/{connectionId}/v2/users",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "searchTerm",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "top",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "isSearchTermRequired",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "skipToken",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ]
      },
      "TestConnection": {
        "path": "/{connectionId}/testconnection",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ]
      },
      "UserProfile_V2": {
        "path": "/{connectionId}/codeless/v1.0/users/{id}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ]
      },
      "Manager_V2": {
        "path": "/{connectionId}/codeless/v1.0/users/{id}/manager",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ]
      },
      "DirectReports_V2": {
        "path": "/{connectionId}/codeless/v1.0/users/{id}/directReports",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ]
      },
      "UserPhoto_V2": {
        "path": "/{connectionId}/codeless/v1.0/users/{id}/photo/$value",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ]
      },
      "TrendingDocuments": {
        "path": "/{connectionId}/codeless/beta/users/{id}/insights/trending",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$filter",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "extractSensitivityLabel",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "fetchSensitivityLabelMetadata",
            "in": "query",
            "required": false,
            "type": "boolean"
          }
        ]
      },
      "HttpRequest": {
        "path": "/{connectionId}/codeless/httprequest",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Uri",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "Method",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "Body",
            "in": "body",
            "required": false,
            "type": "object"
          },
          {
            "name": "ContentType",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader1",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader2",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader3",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader4",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader5",
            "in": "header",
            "required": false,
            "type": "string"
          }
        ]
      }
    }
  },
  "accords": {
    "tableId": "225ddf34-a54b-42c0-b56b-7f1ac2cdfd4f",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "activitestransversales": {
    "tableId": "c98ff885-2780-4f8e-8103-9ed428fe0e99",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "activity": {
    "tableId": "1ecbbdd1-db27-4370-a30e-b51b6d95d9d1",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "agenceresau": {
    "tableId": "25efd047-86d7-44aa-ba1e-a68cf766682a",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "analysedelaiscredit": {
    "tableId": "d26a59f9-306e-4eaf-802a-bd50c0250e4f",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "analysedossierscomites": {
    "tableId": "671cd488-f73b-4659-bf14-b48f99a7a31a",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "analyseengagements": {
    "tableId": "c62636db-6b1f-47e2-8ebd-c670e900de4f",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "analysesuivimep": {
    "tableId": "fdda512c-6cae-4421-b9ed-65ec6f4b5077",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "analysesuivitransmission": {
    "tableId": "42cf885c-e340-4f43-88f2-734a3619050a",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "category": {
    "tableId": "ce9cbf69-be65-47c6-a064-f16f5c9d49a0",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "contrats": {
    "tableId": "a5cbb790-fb7f-4512-9dac-405a9a3d6ba5",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "detailsdossiers": {
    "tableId": "2ea690b0-4bb5-4b9d-b43d-fb362f2ff3fe",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "detailsurmepclient": {
    "tableId": "324d8f4b-974d-41ea-b751-6383a5d4692c",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "dossiersattentecomite": {
    "tableId": "cd2e80ec-a9eb-4a27-9a59-d049ff907e20",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "formations": {
    "tableId": "c8ea3772-1900-492b-a5de-209277a691a8",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "formationunites": {
    "tableId": "dddf2147-30fd-41b5-8578-a1244d3b2a08",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "objectif": {
    "tableId": "682cc61e-d3a7-4bef-8757-8c9c70d8b61b",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "rechercherclientanomalie": {
    "tableId": "4ad30b8b-f586-453b-ae24-30b4fd679e7a",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "repriseprovision": {
    "tableId": "62a91185-a94c-4156-875c-bd2ce52fe376",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "situationmep": {
    "tableId": "a9ff5ae4-bd41-4278-88e4-ac1308a9d5db",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "suivianomalies": {
    "tableId": "aa6f2e72-1797-4fd8-a444-dbf91c06ef2d",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "suiviclientappele": {
    "tableId": "7bcb2e91-7041-45cd-a37f-a1180bcb7926",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "suividepassements": {
    "tableId": "565f3ced-5695-408a-8f89-28e34175238c",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "suividossiersrestructuration": {
    "tableId": "8a3f3fd4-c5ec-4bb7-b707-5a8e79945e8a",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "utilisateurs": {
    "tableId": "462c3867-cfb0-4b87-9a0e-2c813ad2bd02",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  },
  "visiteclientele": {
    "tableId": "358344db-ad54-4720-b93b-4552d40897ca",
    "version": "",
    "primaryKey": "ID",
    "apis": {}
  }
};