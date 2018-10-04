const request = require('request-promise');

const setMenuToUser = (userId,menuId) => {
  console.log("UserID =>", userId);
  request({
    method: 'POST',
    uri: `https://api.line.me/v2/bot/user/${userId}/richmenu/${menuId}`,
    headers: {
      Authorization: `Bearer izECD2yKr/y46AWQ10SrELg9WzdQyJ1BVKeSWqhgrhyf/tTHCkN/J7LU0zYurTP6kt5sd9NYc9qMa5vmXcWRyGusZ+JRKvvzyT7/wDJSyLZC429H8cBMga+7M7isQb2ZLBakLSaKGv/J5z5mlwiU/QdB04t89/1O/w1cDnyilFU=}`,
    },
    json: true,
  });
}

const setMenuToAllUser = (menuId) => {
  request({
    method: 'POST',
    uri: `https://api.line.me/v2/bot/user/all/richmenu/${menuId}`,
    headers: {
      Authorization: `Bearer izECD2yKr/y46AWQ10SrELg9WzdQyJ1BVKeSWqhgrhyf/tTHCkN/J7LU0zYurTP6kt5sd9NYc9qMa5vmXcWRyGusZ+JRKvvzyT7/wDJSyLZC429H8cBMga+7M7isQb2ZLBakLSaKGv/J5z5mlwiU/QdB04t89/1O/w1cDnyilFU=}`,
    },
    json: true,
  });
}

const deleteMenuFromUser = userId => request({
  method: 'DELETE',
  uri: `https://api.line.me/v2/bot/user/${userId}/richmenu`,
  headers: {
    Authorization: `Bearer izECD2yKr/y46AWQ10SrELg9WzdQyJ1BVKeSWqhgrhyf/tTHCkN/J7LU0zYurTP6kt5sd9NYc9qMa5vmXcWRyGusZ+JRKvvzyT7/wDJSyLZC429H8cBMga+7M7isQb2ZLBakLSaKGv/J5z5mlwiU/QdB04t89/1O/w1cDnyilFU=`,
  },
  json: true,
});

module.exports = {
  setMenuToUser,
  setMenuToAllUser,
  deleteMenuFromUser
};
