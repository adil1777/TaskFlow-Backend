import { Request, Response, NextFunction } from "express";
import authService from "./auth.service";
import statusCodes from "../../utils/statusCodes";
import messages from "../../utils/messages";

const register = async (
  req: Request,
  res: Response,
  next: NextFunction
)=>{

  try {
    const result =
      await authService.register(req.body);

    res.status(statusCodes.CREATED).json({
      success: true,
      message:messages.REGISTER_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (
  req: Request,
  res: Response,
  next: NextFunction
)=>{
  try {
    const result =
      await authService.login(req.body);

    res.status(statusCodes.OK).json({
      success: true,
      message:messages.LOGIN_SUCCESS,
      data: result ,
    });
  } catch (error) {
    next(error);
  }
};


const refresh = async(
  req: Request,
  res: Response,
  next: NextFunction
)=> {
  try {
    const result =
      await authService.refresh(
        req.body.refreshToken
      );

    res.status(statusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async(
  req: Request,
  res: Response,
  next: NextFunction
)=> {
  try {
    await authService.logout(
      req.body.refreshToken
    );

    res.status(statusCodes.OK).json({
      success: true,
      message:messages.LOGGED_OUT_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  register,
  login,
  refresh,
  logout

};