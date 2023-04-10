import { Router } from 'express';

import { getFromDataBase, getUser, createUser, getUserById, login, getHotTakes, postHotTake, postReact, getReactionsOfUser, getReactionsOfHotTake, deleteHotTake, getQuests, postQuest, deleteQuest, isQuestDone, completeQuest, isAlreadyFinishedQuest, haveBadge, getTop3 } from '../controllers';

const router = Router();

router.get('/User/:id', getUserById);

router.post('/Login/', login);

router.post('/User/', createUser);

router.get("/HotTake/", getHotTakes);

router.post("/HotTake/", postHotTake);

router.post("/React/", postReact);

router.post("/ReactionsOfUser/", getReactionsOfUser);

router.get("/ReactionsOfHotTake/:id", getReactionsOfHotTake);

router.delete("/HotTake/:idHT/:idUser", deleteHotTake);

router.get("/Quest/", getQuests);

router.post("/Quest/", postQuest);

router.delete("/Quest/:idQuest/:idUser", deleteQuest);

router.post("/CheckQuest/", isQuestDone);

router.post("/CompleteQuest/", completeQuest);

router.get("/FinishedQuest/:idUser/:idQuest", isAlreadyFinishedQuest);

router.get("/Badge/:idUser", haveBadge);

router.get("/Top3/", getTop3);

export default router;