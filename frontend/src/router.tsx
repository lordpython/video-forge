// Use explicit imports to avoid type issues
import React from "react";
const { lazy } = React;
import { createBrowserRouter } from "react-router-dom";
import { userRoutes } from "./user-routes";
import { SuspenseWrapper } from "./prod-components/SuspenseWrapper";

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const SomethingWentWrongPage = lazy(
  () => import("./pages/SomethingWentWrongPage"),
);

export const router = createBrowserRouter(
  [
    ...userRoutes,
    {
      path: "*",
      element: (
        <SuspenseWrapper>
          <NotFoundPage />
        </SuspenseWrapper>
      ),
      errorElement: (
        <SuspenseWrapper>
          <SomethingWentWrongPage />
        </SuspenseWrapper>
      ),
    },
  ]
);
