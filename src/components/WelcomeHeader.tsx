
import React from "react";

interface WelcomeHeaderProps {
  userName: string;
}

const WelcomeHeader = ({ userName }: WelcomeHeaderProps) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">
        Olá, {userName.split(" ")[0]}
      </h1>
      <p className="text-muted-foreground">
        Bem-vindo ao sistema de gerenciamento da Ótica
      </p>
    </div>
  );
};

export default WelcomeHeader;
