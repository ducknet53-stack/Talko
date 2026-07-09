import { Router, type IRouter } from "express";
import healthRouter from "./health";
import uploadImageRouter from "./uploadImage";
import welcomeConversationRouter from "./welcomeConversation";

const router: IRouter = Router();

router.use(healthRouter);
router.use(uploadImageRouter);
router.use(welcomeConversationRouter);

export default router;
