const swaggerJSDoc = require('swagger-jsdoc');


const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Choir Manager API',
    version: '1.0.0',
    description: 'API documentation for the Choir Manager application',
  },
  servers: [
    {
      url: 'https://lead-web-app.onrender.com/', 
      description: 'production Server',
    },
  ],
  components: {
    schemas: {
      ChoirMember: {
        type: 'object',
        properties: {
          choirMemberId: {
            type: 'integer',
            description: 'Unique ID of the choir member',
          },
          choirMemberFirstName: {
            type: 'string',
            description: 'First name of the choir member',
          },
          choirMemberLastName: {
            type: 'string',
            description: 'Last name of the choir member',
          },
          choirMemberGender: {
            type: 'string',
            description: 'Gender of the choir member',
          },
          choirMemberPhoneNumber: {
            type: 'string',
            description: 'Phone number of the choir member',
          },
        },
      },
      Admin: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Unique ID of the admin',
          },
          adminName: {
            type: 'string',
            description: 'Name of the admin',
          },
          adminPhoneNumber: {
            type: 'string',
            description: 'Phone number of the admin',
          },
          adminEmail: {
            type: 'string',
            description: 'Email address of the admin',
          },
          adminPassword: {
            type: 'string',
            description: 'Password of the admin',
          },
        },
      },
      Announcement: {
        type: 'object',
        properties: {
          choirMemberId: {
            type: 'integer',
            description: 'ID of the choir member receiving the announcement',
          },
          message: {
            type: 'string',
            description: 'Content of the announcement',
          },
          dateSent: {
            type: 'string',
            format: 'date-time',
            description: 'Date and time the announcement was sent',
          },
        },
      },
      AbsentChoirMember: {
        type: 'object',
        properties: {
          choirMemberId: {
            type: 'integer',
            description: 'Unique ID of the absent choir member',
          },
          choirMemberFirstName: {
            type: 'string',
            description: 'First name of the absent choir member',
          },
          choirMemberLastName: {
            type: 'string',
            description: 'Last name of the absent choir member',
          },
          choirMemberGender: {
            type: 'string',
            description: 'Gender of the absent choir member',
          },
          choirMemberPhoneNumber: {
            type: 'string',
            description: 'Phone number of the absent choir member',
          },
          churchAbsentRate: {
            type: 'integer',
            description: 'Number of absences in church events',
          },
          repetitionAbsentRate: {
            type: 'integer',
            description: 'Number of absences in repetitions',
          },
          weddingAbsentRate: {
            type: 'integer',
            description: 'Number of absences in weddings',
          },
          deathAbsentRate: {
            type: 'integer',
            description: 'Number of absences in death-related events',
          },
        },
      },
      Attendence: {
        type: 'object',
        properties: {
          attendenceId: {
            type: 'integer',
            description: 'Unique ID of the attendance record',
          },
          attendenceType: {
            type: 'string',
            enum: ['church', 'wedding', 'Repetition', 'Death'],
            description: 'Type of the attendance',
          },
          attendenceStatus: {
            type: 'string',
            enum: ['present', 'absent', 'authorized'],
            description: 'Status of the attendance',
          },
          attendenceDate: {
            type: 'string',
            format: 'date',
            description: 'Date of the attendance',
          },
          choirMemberId: {
            type: 'integer',
            description: 'ID of the choir member associated with the attendance record',
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js','./swagger/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
