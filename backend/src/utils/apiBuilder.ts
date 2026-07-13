import express, { Router, Request, Response } from "express";
import Util from "./util";
import { ResponseStatus } from "./constants";

export default class API {
    static configRoute(root: string) {
        const router = Router();
        return new PathBuilder(root, router);
    }
}

class MethodBuilder {
    private root: string;
    private subPath: string;
    private router: Router;

    constructor(root: string, subPath: string, router: Router) {
        this.root = root;
        this.subPath = subPath;
        this.router = router;
    }

    asGET(methodToExecute: (req: any, res: any) => any) {
        return new Builder("get", this.root, this.subPath, methodToExecute, this.router);
    }

    asPOST(methodToExecute: (req: any, res: any) => any) {
        return new Builder("post", this.root, this.subPath, methodToExecute, this.router);
    }

    asDELETE(methodToExecute: (req: any, res: any) => any) {
        return new Builder("delete", this.root, this.subPath, methodToExecute, this.router);
    }

    asUPDATE(methodToExecute: (req: any, res: any) => any) {
        return new Builder("patch", this.root, this.subPath, methodToExecute, this.router);
    }
}

class PathBuilder {
    private root: string;
    private router: Router;

    constructor(root: string, router: Router) {
        this.root = root;
        this.router = router;
    }

    addPath(subPath: string) {
        return new MethodBuilder(this.root, subPath, this.router);
    }

    getRouter() {
        return this.router;
    }
}

class Builder {
    private methodType: "get" | "post" | "delete" | "patch";
    private root: string;
    private subPath: string;
    private executer: (req: any, res: any) => any;
    private router: Router;
    private middlewaresList: any[];

    constructor(
        methodType: "get" | "post" | "delete" | "patch",
        root: string,
        subPath: string,
        executer: (req: any, res: any) => any,
        router: Router,
        middlewaresList: any[] = []
    ) {
        this.methodType = methodType;
        this.root = root;
        this.subPath = subPath;
        this.executer = executer;
        this.router = router;
        this.middlewaresList = middlewaresList;
    }

    userMiddlewares(...middlewares: any[]) {
        return new Builder(
            this.methodType,
            this.root,
            this.subPath,
            this.executer,
            this.router,
            [...this.middlewaresList, ...middlewares]
        );
    }

    build() {
        const controller = async (req: Request, res: Response) => {
            try {
                const response = await this.executer(req, res);
                res.status(ResponseStatus.Success).send(response);
            } catch (e) {
                console.log(e);
                res.locals.errorMessage = e;
                res.status(ResponseStatus.BadRequest).send(Util.getErrorMessage(e));
            }
        };

        const middlewares = [...this.middlewaresList];
        this.router[this.methodType](this.root + this.subPath, ...middlewares, controller as any);

        return new PathBuilder(this.root, this.router);
    }
}
