import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import servicesRouter from "./services";
import ordersRouter from "./orders";
import depositsRouter from "./deposits";
import nokosRouter from "./nokos";
import supportRouter from "./support";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(servicesRouter);
router.use(ordersRouter);
router.use(depositsRouter);
router.use(nokosRouter);
router.use(supportRouter);
router.use(dashboardRouter);

export default router;
