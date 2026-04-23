
// // models/Author.js
// const mongoose = require('mongoose');

// const socialSchema = new mongoose.Schema({
//   twitter: String,
//   quora: String,
//   reddit: String,
//   medium: String,
// });

// const authorSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: [true, 'Author name is required'] },
//     gender: { type: String, enum: ['Male', 'Female', 'Other'] },
//     profileImage: String,
//     country: String,
//     bio: String,
//     websiteLink: String,
//     social: socialSchema,
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Category',
//       required: [true, 'Category is required'],
//     },
//     email: String,
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Author', authorSchema);

// models/Author.js
const mongoose = require('mongoose');

const socialSchema = new mongoose.Schema({
  twitter: String,
  quora: String,
  reddit: String,
  medium: String,
});

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Author name is required'] },
    slug: { type: String, unique: true, sparse: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    profileImage: String,
    country: String,
    bio: String,
    websiteLink: String,
    social: socialSchema,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    email: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Author', authorSchema);