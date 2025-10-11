const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');

const Question = require('../src/models/Question');
const Answer = require('../src/models/Answer');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // ---------- QUESTIONS ----------
    const questions = await Question.find(
      { image: { $exists: true, $ne: null, $ne: "" } },
      { image: 1 }
    ).lean();

    console.log(`Found ${questions.length} questions to migrate.`);

    for (const question of questions) {
      try {
        const fileName = path.basename(question.image);
        const oldImagePath = path.join(__dirname, '..', 'uploads', fileName);

        if (fs.existsSync(oldImagePath)) {
          const newDir = path.join(__dirname, '..', 'uploads', 'questions', question._id.toString());
          fs.mkdirSync(newDir, { recursive: true });

          const newImagePath = path.join(newDir, fileName);
          fs.renameSync(oldImagePath, newImagePath);

          const newImageUrl = `/uploads/questions/${question._id.toString()}/${fileName}`;

          await Question.updateOne(
            { _id: question._id },
            { $set: { images: [newImageUrl] }, $unset: { image: 1 } } 
          );

          console.log(`Migrated question ${question._id}`);
        } else {
          console.log(`Image not found for question ${question._id}: ${oldImagePath}`);
          await Question.updateOne(
            { _id: question._id },
            { $unset: { image: 1 } } 
          );
        }
      } catch (err) {
        console.error(`Error migrating question ${question._id}:`, err);
      }
    }

    // ---------- ANSWERS ----------
    const answers = await Answer.find(
      { image: { $exists: true, $ne: null, $ne: "" } },
      { image: 1, questionId: 1 }
    ).lean();

    console.log(`Found ${answers.length} answers to migrate.`);

    for (const answer of answers) {
      try {
        const fileName = path.basename(answer.image);
        const oldImagePath = path.join(__dirname, '..', 'uploads', fileName);

        if (fs.existsSync(oldImagePath)) {
          const newDir = path.join(__dirname, '..', 'uploads', 'answers', answer.questionId.toString());
          fs.mkdirSync(newDir, { recursive: true });

          const newImagePath = path.join(newDir, fileName);
          fs.renameSync(oldImagePath, newImagePath);

          const newImageUrl = `/uploads/answers/${answer.questionId.toString()}/${fileName}`;

          await Answer.updateOne(
            { _id: answer._id },
            { $set: { images: [newImageUrl] }, $unset: { image: 1 } } 
          );

          console.log(`Migrated answer ${answer._id}`);
        } else {
          console.log(`Image not found for answer ${answer._id}: ${oldImagePath}`);
          await Answer.updateOne(
            { _id: answer._id },
            { $unset: { image: 1 } } 
          );
        }
      } catch (err) {
        console.error(`Error migrating answer ${answer._id}:`, err);
      }
    }

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

migrate();
