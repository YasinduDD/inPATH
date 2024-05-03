const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const annSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  announcement: {
    type: String, // assuming you'll store the file path
    required: true,
  }
}, {timestamps: true});

const ann = mongoose.model('ann', annSchema);
module.exports = ann;

// const annSchema = new Schema({
//     title: {
//       type: String,
//       required: true,
//     },
//     announcement: {
//       type: String, // assuming you'll store the file path
//       required: true,
//     }
//   }, { timestamps: true });
  
//   const ann = mongoose.model('ann', annSchema, 'anns'); // Use 'anns' as the collection name
//   module.exports = ann;

