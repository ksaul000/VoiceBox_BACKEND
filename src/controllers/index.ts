import mssql from 'mssql';
import { RequestHandler } from 'express';

import { validateCompleteQuestInput, validateDeleteHotTakeInput, validateDeleteQuestInput, validateFinishQuestInput, validateHaveBadgeInput, validateHotTakesInput, validateQuestInput, validateReactInput, validateUserInput } from '../validators'

import qrCode from 'qrcode';

import { getConnectionPool, getRequest } from '../mssql'

import bcrypt from 'bcryptjs';
import { error } from 'console';




export const getFromDataBase: RequestHandler = async (req, res, next) => {
  const response = await getRequest()
    .query('select * from teams');
  response.recordset[0];
  res.status(200).send(response.recordset);
};


export const getUser: RequestHandler = async (req, res, next) => {
  const users = await getRequest().query('SELECT * FROM USERS');
  const arr : any[] = [];
  const body = { resourceType: 'Bundle', entry : arr, errorMesages : [] };
  body.entry = users.recordset.map((user) =>{
    return {
      resource: {
        "Id": user.id,
        "Nickname": user.nickname,
        "Email": user.email,
        "Password": user.password,
        "Tokens": user.tokens
      }
    }
  })
  res.status(200).send(body);
};

export const getUserById: RequestHandler = async (req, res, next) => {
  const users = await getRequest().query(`SELECT * FROM USERS WHERE ID=${req.params.id}`);
  const arr : any[] = [];
  const body = { resourceType: 'Bundle', entry : arr, errorMesages : [] };
  body.entry = users.recordset.map((user) =>{
    return {
      resource: {
        "Id": user.id,
        "Nickname": user.nickname,
        "Tokens": user.tokens
      }
    }
  })
  res.status(200).send(body);
};


export const createUser: RequestHandler = async (req, res, next) => {
  const errs = await validateUserInput(req.body);
    if(errs.length == 0){
      const create_user = await getRequest()
      .input('usr_nickname', mssql.VarChar, req.body.nickname)
      .input('usr_email', mssql.VarChar, req.body.email)
      .input('usr_password', mssql.VarChar, await bcrypt.hash(req.body.password, await bcrypt.genSalt(10)))
      .execute('usp_save_user');
      //req.body.id = `${create_building.recordset[0].id_building}`;
      res.status(201).json({ message: 'Created the user.' });
    }
    else{
      res.status(401).json({ message: "Server can't create user.", errorMesages: errs });
    }
};

export const login: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await getRequest().query(`SELECT id, password FROM USERS WHERE email='${email}'` );
    if(user.recordset.length == 0){
      res.status(401).json({ id: -1, message: 'Invalid email.' });
    }
    else{
      if(await bcrypt.compare(password, user.recordset[0].password)){
        res.status(200).json({ id: user.recordset[0].id, message: 'Succesfully Login.' });
      }
      else{
        res.status(401).json({ id: -1, message: 'Invalid password.' });
      }
    }
};

export const getHotTakes: RequestHandler = async (req, res, next) => {
  const posts = await getRequest().query('SELECT ht.id, content, publication_date, user_id, nickname, topic FROM hot_takes AS ht INNER JOIN users AS us ON ht.user_id=us.id WHERE publication_date >= DATEADD(day, -2, GETDATE()) ORDER BY publication_date DESC');
  const arr : any[] = [];
  const body = { resourceType: 'Bundle', entry : arr, errorMesages : [] };
  body.entry = posts.recordset.map((post) =>{
    return {
      resource: {
        "Id": post.id,
        "Content": post.content,
        "PublicationDate": post.publication_date,
        "UserId": post.user_id,
        "UserNickname": post.nickname,
        "Topic": post.topic
      }
    }
  })
  res.status(200).send(body);
};

export const postHotTake: RequestHandler = async (req, res, next) => {

  const errs = await validateHotTakesInput(req.body);

    if(errs.length == 0){
      const responseBody: any = [];
      const create_HotTake = await getRequest()
      .input('ht_content', mssql.VarChar, req.body.Content)
      .input('ht_usr_id', mssql.Int, req.body.UserId)
      .input('ht_topic', mssql.VarChar, req.body.Topic)
      .execute('usp_save_hot_take');
      responseBody.hotTakeId=`${create_HotTake.recordset[0].id}`;
      const hotTake=await getRequest().query(`SELECT ht.id, content, publication_date, user_id, nickname, topic FROM hot_takes AS ht INNER JOIN users AS us ON ht.user_id=us.id WHERE ht.id=${create_HotTake.recordset[0].id}`);
      res.status(201).json({message: 'Created the Hot Take.', createdHotTake: 
        {resource: {
          "Id": hotTake.recordset[0].id,
          "Content": hotTake.recordset[0].content,
          "PublicationDate": hotTake.recordset[0].publication_date,
          "UserId": hotTake.recordset[0].user_id,
          "UserNickname": hotTake.recordset[0].nickname,
          "Topic": hotTake.recordset[0].topic
        }}});
    }
    else{
      res.status(403).json({ message: "Server can't Hot Take.", errorMesages: errs });
    }
};


export const postReact: RequestHandler = async (req, res, next) => {
  const errs = await validateReactInput(req.body);
    if(errs.length == 0){
      const create_react = await getRequest()
      .input('UserId', mssql.Int, req.body.UserId)
      .input('HotTakeId', mssql.Int, req.body.HotTakeId)
      .input('ReactType', mssql.VarChar, req.body.ReactType)
      .execute('usp_add_or_update_react');
      //req.body.id = `${create_building.recordset[0].id_building}`;
      res.status(201).json({ message: 'Added the reaction.' });
    }
    else{
      res.status(401).json({ message: "Server can't create the reaction.", errorMesages: errs });
    }
};

export const getReactionsOfUser: RequestHandler = async (req, res, next) => {
  const agreeNumber = await getRequest().query(`SELECT COUNT(*) as agree_count FROM Reacts r JOIN react_types rt ON r.react_type_id = rt.id WHERE rt.type_name = 'AGREE' AND r.user_id = ${req.body.UserId} AND r.hot_take_id = ${req.body.HotTakeId};`);
  const unclearNumber = await getRequest().query(`SELECT COUNT(*) as unclear_count FROM Reacts r JOIN react_types rt ON r.react_type_id = rt.id WHERE rt.type_name = 'Opinion Is Unclear' AND r.user_id = ${req.body.UserId} AND r.hot_take_id = ${req.body.HotTakeId};`);
  const disagreeNumber = await getRequest().query(`SELECT COUNT(*) as disagree_count FROM Reacts r JOIN react_types rt ON r.react_type_id = rt.id WHERE rt.type_name = 'DISAGREE' AND r.user_id = ${req.body.UserId} AND r.hot_take_id = ${req.body.HotTakeId};`);

  res.status(200).send({agree_pressed: agreeNumber.recordset[0].agree_count==1,
                          unclear_pressed: unclearNumber.recordset[0].unclear_count==1,
                          disagree_pressed: disagreeNumber.recordset[0].disagree_count==1
                        });
};

export const getReactionsOfHotTake: RequestHandler = async (req, res, next) => {
  const agreeNumber = await getRequest().query(`SELECT COUNT(*) as agree_count FROM Reacts r JOIN react_types rt ON r.react_type_id = rt.id WHERE rt.type_name = 'AGREE' AND r.hot_take_id = ${req.params.id};`);
  const unclearNumber = await getRequest().query(`SELECT COUNT(*) as unclear_count FROM Reacts r JOIN react_types rt ON r.react_type_id = rt.id WHERE rt.type_name = 'Opinion Is Unclear' AND r.hot_take_id = ${req.params.id};`);
  const disagreeNumber = await getRequest().query(`SELECT COUNT(*) as disagree_count FROM Reacts r JOIN react_types rt ON r.react_type_id = rt.id WHERE rt.type_name = 'DISAGREE' AND r.hot_take_id = ${req.params.id};`);

  res.status(200).send({agree_count: agreeNumber.recordset[0].agree_count,
                        unclear_count: unclearNumber.recordset[0].unclear_count,
                        disagree_count: disagreeNumber.recordset[0].disagree_count
                        });
};

export const deleteHotTake: RequestHandler = async(req, res, next) => {
  const input = {HotTakeId: Number(req.params.idHT), UserId: Number(req.params.idUser)};
  const errs = await validateDeleteHotTakeInput(input);

  if(errs.length == 0){
    await getRequest()
    .input('id_hot_take', input.HotTakeId)
    .query('DELETE FROM Reacts WHERE hot_take_id = @id_hot_take;');
    await getRequest()
    .input('id_hot_take', input.HotTakeId)
    .query('DELETE FROM hot_takes WHERE id=@id_hot_take');
    res.json({ message: 'Hot Take deleted!' });
  }
  else{
    res.status(401).json({ message: "Server can't delete Hot Take.", errorMesages: errs });
  }
};


export const getQuests: RequestHandler = async (req, res, next) => {
  const quests = await getRequest().query('SELECT q.id, q.topic, q.publication_date, q.user_id, u.nickname FROM Quests q INNER JOIN users u ON q.user_id = u.id WHERE publication_date >= DATEADD(day, -2, GETDATE()) ORDER BY q.publication_date DESC');
  const arr : any[] = [];
  const body = { resourceType: 'Bundle', entry : arr, errorMesages : [] };
  body.entry = quests.recordset.map((quest) =>{
    return {
      resource: {
        "Id": quest.id,
        "Topic": quest.topic,
        "PublicationDate": quest.publication_date,
        "UserId": quest.user_id,
        "UserNickname": quest.nickname
      }
    }
  })
  res.status(200).send(body);
};

export const postQuest: RequestHandler = async (req, res, next) => {
  const tokens=(await getRequest().query(`SELECT tokens FROM users WHERE id = ${req.body.UserID} AND tokens >= 30`));
  if (tokens.recordset.length == 1){
    await getRequest().query(`UPDATE users SET tokens = tokens - 30 WHERE id = ${req.body.UserID};`);
    const errs = await validateQuestInput(req.body);
    if(errs.length == 0){
    const create_quest = await getRequest()
      .input('qt_user_id', mssql.Int, req.body.UserID)
      .input('qt_topic', mssql.VarChar, req.body.Topic)
      .execute('usp_insert_quest');
      const quest=await getRequest().query(`SELECT q.id, q.topic, q.publication_date, q.user_id, u.nickname FROM Quests q INNER JOIN users u ON q.user_id = u.id WHERE q.id=${create_quest.recordset[0].id}`);
      res.status(201).json({message: 'Created the quest. ', createdQuest: 
        {resource: {
          "Id": quest.recordset[0].id,
          "PublicationDate": quest.recordset[0].publication_date,
          "Topic": quest.recordset[0].topic,
          "UserId": quest.recordset[0].user_id,
          "UserNickname": quest.recordset[0].nickname,
        }}});
    }
    else{
      res.status(403).json({ message: "Server can't create quest.", errorMesages: errs });
    }
  }
  else{
    res.status(403).json({ message: "Server can't create quest.", errorMesages: ["You don't have enough tokens!"] });
  }
  
};

export const deleteQuest: RequestHandler = async(req, res, next) => {
  const input = {QuestId: Number(req.params.idQuest), UserId: Number(req.params.idUser)};
  const errs = await validateDeleteQuestInput(input);

  if(errs.length == 0){
    await getRequest()
    .input('id_quest', input.QuestId)
    .query('DELETE FROM Quests WHERE id=@id_quest');
    res.json({ message: 'Quest deleted!' });
  }
  else{
    res.status(401).json({ message: "Server can't delete Quest.", errorMesages: errs });
  }
};


export const isQuestDone: RequestHandler = async (req, res, next) => {
  const reactedHotTakes = await getRequest().query(`SELECT COUNT(*) AS num_reacts FROM Reacts r JOIN hot_takes ht ON r.hot_take_id = ht.id WHERE r.user_id = ${req.body.UserId} AND ht.topic = '${req.body.Topic}' AND ht.user_id <> ${req.body.UserId};`);
  const postedHotTakes = await getRequest().query(`SELECT COUNT(*) AS num_hot_takes FROM hot_takes WHERE user_id = ${req.body.UserId} AND topic = '${req.body.Topic}';`);
  if(reactedHotTakes.recordset.length > 0 && postedHotTakes.recordset.length > 0){
    if(reactedHotTakes.recordset[0].num_reacts>=3 && postedHotTakes.recordset[0].num_hot_takes>=1)
    {
      res.status(200).json({ isCompleted: true });

    }
    else{
      res.status(200).json({ isCompleted: false , errorMesages: [`You only reacted to ${reactedHotTakes.recordset[0].num_reacts} and posted ${postedHotTakes.recordset[0].num_hot_takes}, quest cant be completed! If you react to your own HotTakes, does not count!`] });
    }
  }
  else{
    res.status(401).json({ message: "Server can't complete quest.", errorMesages: ["Quest can't be completed!"] });
  }
};

export const completeQuest: RequestHandler = async (req, res, next) => {
  const reactedHotTakes = await getRequest().query(`SELECT COUNT(*) AS num_reacts FROM Reacts r JOIN hot_takes ht ON r.hot_take_id = ht.id WHERE r.user_id = ${req.body.UserId} AND ht.topic = '${req.body.Topic}' AND ht.user_id <> ${req.body.UserId};`);
  const postedHotTakes = await getRequest().query(`SELECT COUNT(*) AS num_hot_takes FROM hot_takes WHERE user_id = ${req.body.UserId} AND topic = '${req.body.Topic}';`);
  if(reactedHotTakes.recordset.length > 0 && postedHotTakes.recordset.length > 0){
    if(reactedHotTakes.recordset[0].num_reacts>=3 && postedHotTakes.recordset[0].num_hot_takes>=1)
    {
            const errs = await validateCompleteQuestInput(req.body);  

            if(errs.length == 0){
              await getRequest().query(`UPDATE users SET tokens=tokens+10 WHERE id=${req.body.UserId};`);
              await getRequest()
              .input('user_id', mssql.Int, req.body.UserId)
              .input('topic', mssql.VarChar, req.body.Topic)
              .execute('usp_add_completed_quest');
              res.status(201).json({message: 'Quest Completed', isCompleted: true })
            }
            else{
              res.status(403).json({ message: "Server can't complete quest.", errorMesages: errs,  isCompleted: false });
            }
    }
    else{
      res.status(200).json({ isCompleted: false , errorMesages: [`You only reacted to ${reactedHotTakes.recordset[0].num_reacts} and posted ${postedHotTakes.recordset[0].num_hot_takes}, quest cant be completed! If you react to your own HotTakes, does not count!`] });
    }
  }
  else{
    res.status(401).json({ message: "Server can't complete quest.", errorMesages: ["Quest can't be completed!"],   isCompleted: false });
  }
};


export const isAlreadyFinishedQuest: RequestHandler = async (req, res, next) => {
    const errs = await validateFinishQuestInput({UserId: Number(req.params.idUser), QuestId: Number(req.params.idQuest)});
    if(errs.length == 0)
    {
      console.log(req.params.idUser);
      console.log(req.params.idQuest);
      const response  = await getRequest().query(`select * from completed_quests where user_id=${Number(req.params.idUser)} and quest_id=${Number(req.params.idQuest)} and publication_date >= DATEADD(day, -2, GETDATE());`);
      console.log(response);
      if(response.recordset.length > 0){
        res.status(200).json({ isFinished: true });
      }
      else{
        res.status(200).json({ isFinished: false });
      }
    }
    else{
      res.status(200).json({ message: "Server can't verify this quest.", errorMesages: errs });
    }
};

export const haveBadge: RequestHandler = async (req, res, next) => {
  const errs = await validateHaveBadgeInput(Number(req.params.idUser));
  if(errs.length == 0)
  {
    const response  = await getRequest().query(`SELECT COUNT(*) AS num_appearances FROM completed_quests where user_id=${Number(req.params.idUser)} and publication_date >= DATEADD(day, -2, GETDATE());`);
    if(response.recordset.length > 0){
      if(response.recordset[0].num_appearances>=6){
        res.status(200).json({ badge: true });
      }
      else{
        res.status(200).json({ badge: false });
      }
    }
    else{
      res.status(200).json({ badge: false });
    }
  }
  else{
    res.status(403).json({ message: "Server can't get Badge.", errorMesages: errs });
  }
};

export const getTop3: RequestHandler = async (req, res, next) => {
    const response  = await getRequest().query(`SELECT u.id, u.nickname, COUNT(*) as num_completed_quests FROM users u INNER JOIN completed_quests cq ON cq.user_id = u.id WHERE cq.publication_date >= DATEADD(day, -2, GETDATE()) GROUP BY u.id, u.nickname ORDER BY num_completed_quests DESC OFFSET 0 ROWS FETCH NEXT 3 ROWS ONLY;`);
    if(response.recordset.length === 3){
      res.status(200).json(response);
    }
    else{
      res.status(403).json({ message: "Server can't get top 3 users.", errorMesages: ['Gand get top 3 users'] });
    }
};



