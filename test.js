import axios from 'axios';

const options = {
  method: 'POST',
  url: 'https://api.omnisend.com/v5/contacts',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    'X-API-KEY': '686fe8372a862bc6404689ad-XnU3atnlb2X7BKzEXEZ1CGqGKAdCBV508NxZabNXlSpKdW03Vk'
  },
  data: {
    customProperties: {newKey: 'New Value'},
    identifiers: [
      {
        channels: {email: {status: 'subscribed', statusDate: '2025-07-11T00:00:00Z'}},
        consent: {
          createdAt: '2025-07-11T00:00:00Z',
          ip: '192.158.1.38',
          source: 'omnisend-form',
          userAgent: 'Mozilla/5.0'
        },
        id: 'francisco.onel@valventus.com',
        type: 'email'
      }
    ]
  }
};

axios
  .request(options)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));