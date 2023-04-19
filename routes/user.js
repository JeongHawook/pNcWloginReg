const express = require("express");
const router = express.Router();
const User = require("../schemas/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  const { nickname, password, confirmPassword } = req.body;

  if (!nickname || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다.1" });
  }
  const nicknameRegex = /^[a-zA-Z0-9]{3,}$/;
  const passwordRegex1 = /^\w{4,}$/;
  const passwordRegex2 = new RegExp(`^(?!.*${nickname}).{4,}$`, "i");

  if (!nicknameRegex.test(nickname)) {
    return res
      .status(412)
      .json({ errorMessage: "닉네임의 형식이 일치하지 않습니다." });
  }

  if (password !== confirmPassword) {
    return res
      .status(412)
      .json({ errorMessage: "password가 일치하지 않습니다" });
  }
  if (!passwordRegex1.test(password)) {
    return res
      .status(412)
      .json({ errorMessage: "패스워드 형식이 일치하지 않습니다" });
  }
  if (!passwordRegex2.test(password)) {
    return res
      .status(412)
      .json({ errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });
  }
  //400 예외 처리 try-catch? unique 뺴기???
  try {
    const getNickname = await User.findOne({ nickname: nickname }); //나중에 수정
    const bcryptPassword = await bcrypt.hash(password, 10);
    await User.create({
      nickname: nickname,
      password: bcryptPassword,
    });
    return res.status(201).json({ message: "회원가입에 성공하셨습니다." });
  } catch (error) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      // Handle duplicate key error for nickname field
      return res.status(412).json({ errorMessage: "중복된 닉네임입니다." });
    }
    return res
      .status(400)
      .json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다.1" });
  }
});
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;
  //  ||nickname
  try {
    const getnickName = await User.findOne({ nickname: nickname });
    const passwordMatch = await bcrypt.compare(password, getnickName.password);

    // if(getnickName  && passwordMatch){

    // }
    const token = jwt.sign({ nickname: getnickName.nickname }, "custom-key");
    res.cookie("Authorization", `Bearer ${token}`);
    return res.status(200).json({ token: token });
  } catch (error) {
    if (error instanceof TypeError) {
      return res
        .status(404)
        .json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
    }
    return res.status(404).json({ errorMessage: "로그인에 실패하였습니다." });
  }
});

module.exports = router;
