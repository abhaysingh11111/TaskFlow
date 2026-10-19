import React, { createContext, useState } from 'react';

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
   const [refreshKey, setRefreshKey] = useState(0);

    return (
      <DashboardContext.Provider value={{ refreshKey, setRefreshKey }}>
         {children}
      </DashboardContext.Provider>
    );
};