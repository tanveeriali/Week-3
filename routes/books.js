const { Router } = require("express");
const router = Router();

const bookDAO = require("../daos/book");

// Create
router.post("/", async (req, res, next) => {
  const book = req.body;
  if (!book || JSON.stringify(book) === "{}") {
    res.status(400).send("book is required");
  } else {
    try {
      const savedBook = await bookDAO.create(book);
      res.json(savedBook);
    } catch (e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});

//GET book stats
router.get("/authors/stats", async (req, res, next) => {
  const { authorInfo } = req.query;
  const books = await bookDAO.getStats(authorInfo);
  if (books) {
    res.json(books);
  } else {
    res.sendStatus(404);
  }
});

//GET search
router.get("/search", async (req, res, next) => {
  let { page, perPage, query } = req.query;
  const books = await bookDAO.getSearch(query);
  if (books) {
    res.json(books);
  } else {
    res.sendStatus(404);
  }
});

// GET single book
router.get("/:id", async (req, res, next) => {
  const book = await bookDAO.getById(req.params.id);
  if (book) {
    res.json(book);
  } else {
    res.sendStatus(404);
  }
});

// Read - all books
router.get("/", async (req, res, next) => {
  let { page, perPage, authorId } = req.query;
  page = page ? Number(page) : 0;
  perPage = perPage ? Number(perPage) : 10;
  authorId = !authorId ? null : authorId;
  const books = await bookDAO.getAll(page, perPage, authorId);
  if (books) {
    res.json(books);
  } else {
    res.sendStatus(404);
  }
});

router.put("/:id", async (req, res, next) => {
  const bookId = req.params.id;
  const book = req.body;
  if (!book || JSON.stringify(book) === "{}") {
    res.status(400).send('book is required"');
  } else {
    try {
      const success = await bookDAO.updateById(bookId, book);
      res.sendStatus(success ? 200 : 400);
    } catch (e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});

// Delete
router.delete("/:id", async (req, res, next) => {
  const bookId = req.params.id;
  try {
    const success = await bookDAO.deleteById(bookId);
    res.sendStatus(success ? 200 : 400);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
