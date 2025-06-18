import * as React from 'react';

const FormField = ({ children }: { children: React.ReactNode }) => {
    return <div className="grid w-full items-center gap-1.5">{children}</div>;
};

export { FormField }; 