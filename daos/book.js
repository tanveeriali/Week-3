const mongoose = require("mongoose");

const Book = require("../models/book");

module.exports = {};

module.exports.getAll = async (page, perPage, authorId) => {
  try {
    const query = authorId !== null ? { authorId: authorId } : {};
    const book = Book.find(query)
      .limit(perPage)
      .skip(perPage * page)
      .lean();

    return book;
  } catch (e) {
    return null;
  }
};
module.exports.getStats = async (authorInfo) => {
  try {
    if (!authorInfo) {
      return Book.aggregate([
        {
          $group: {
            _id: "$authorId",
            averagePageCount: { $avg: "$pageCount" },
            numBooks: { $sum: 1 },
            titles: { $addToSet: "$title" },
          },
        },
        {
          $project: {
            _id: 0,
            authorId: "$_id",
            averagePageCount: 1,
            numBooks: 1,
            titles: { $reverseArray: "$titles" },
          },
        },
      ]);
    } else {
      return Book.aggregate([
        {
          $group: {
            _id: "$authorId",
            averagePageCount: { $avg: "$pageCount" },
            numBooks: { $sum: 1 },
            titles: { $addToSet: "$title" },
          },
        },
        {
          $project: {
            _id: 0,
            authorId: "$_id",
            averagePageCount: 1,
            numBooks: 1,
            titles: { $reverseArray: "$titles" },
          },
        },
        {
          $lookup: {
            from: "authors",
            localField: "_id",
            foreignField: "authorId",
            as: "author",
          },
        },
        { $unwind: "$author" },
      ]);
    }
  } catch (e) {
    return null;
  }
};
module.exports.getSearch = async (text) => {
  try {
    const book = Book.find(
      { $text: { $search: text } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .lean();
    return book;
  } catch (e) {
    return null;
  }
};

module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
};

module.exports.deleteById = async (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.deleteOne({ _id: bookId });
  return true;
};

module.exports.updateById = async (bookId, newObj) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.updateOne({ _id: bookId }, newObj);
  return true;
};

module.exports.create = async (bookData) => {
  const { ISBN } = bookData;
  try {
    if (await Book.exists({ ISBN: ISBN })) {
      throw new BadDataError(
        "Book with ISBN number " + ISBN + " already exists."
      );
    } else {
      const created = await Book.create(bookData);
      return created;
    }
  } catch (e) {
    if (e.message.includes("validation failed")) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
