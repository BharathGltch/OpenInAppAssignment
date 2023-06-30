const Imap = require('imap');//for managing the mail protocol
const nodemailer = require('nodemailer');//nodemailer is for sending any mails you need to
const { google } = require('googleapis');//used to use its apis


//const vacationMessage = "I am out on vacation";

const CLIENT_ID='147165948238-fgq3sj5kgr2hm5c05v6qnrh0jrv4g490.apps.googleusercontent.com'
const CLIENT_SECRET='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'
const REDIRECT_URI='https://developers.google.com/oauthplayground'
const REFRESH_TOKEN='1//04bwuiWPqgd0yCgYIARAAGAQSNwF-L9Ir3E0jqMFWkjZvNhfLAThDpcqUoFaK9ir-44Sv2j5NI2q9vgfdjKC56eurutVngM-bGjg'

const emailConfig = {
  user: 'bharrathch@gmail.com',
  password: '*********',
  host: 'imap.gmail.com', 
  port: 993,
  tls: {
    rejectUnauthorized: false
  }
};
//For using any g api, we need to provide the oauth consent screen
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(from) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        type: 'OAuth2',
        user: 'bharrathch@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: 'bharrathch@gmail.com',
      to: from,
      subject: "Hello from the Vacation",
      text: "Hey, I am on vacation. This is an automated message.",
      html: '<h1>Hey, I am on vacation. This is an automated message.</h1>'
    };

    const result = await transport.sendMail(mailOptions);
    return result;

  } catch (error) {
    return error;
  }
}


const imap = new Imap(emailConfig);
imap.once('ready', function () {
  imap.openBox('INBOX', true, function (err, box) {
    if (err) throw err;

    const searchCriteria = ['UNSEEN'];//Labels in the gmail api
    const fetchOptions = { bodies: ['HEADER.FIELDS (FROM SUBJECT)'], markSeen: false };

    imap.search(searchCriteria, function (err, results) {
      if (err) throw err;

      const fetch = imap.fetch(results, fetchOptions);

      fetch.on('message', function (msg, seqno) {
        msg.on('body', function (stream, info) {
          let buffer = '';
          stream.on('data', function (chunk) {
            buffer += chunk.toString('utf8');
          });

          stream.once('end', function () {
            const header = Imap.parseHeader(buffer);
            const fromAddress = header.from[0].address;
            const subject = header.subject[0];

            console.log('From:', fromAddress);
            console.log('Subject:', subject);

            if(fromAddress!=undefined)
            sendMail(fromAddress);
          });
        });
      });

      fetch.once('end', function () {
        imap.end();
      });
    });
  });
});

imap.once('error', function (err) {
  console.log(err);
});

imap.once('end', function () {
  console.log('Connection ended');
});

imap.connect();