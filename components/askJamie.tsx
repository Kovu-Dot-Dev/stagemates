import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardDescription,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const AskJamie: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 1000,
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          background: "#0078D4",
          color: "#fff",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          fontSize: "2rem",
          cursor: "pointer",
        }}
        aria-label="Ask Jamie"
      >
        💬
      </Button>

      {/* Modal/Dialog */}
      {open && (
        <>
          <Card
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 1001,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
            onClick={() => setOpen(false)}
          >
            <Card
              style={{
                background: "#fff",
                borderRadius: "1rem",
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                width: "90vw",
                height: "80vh",
                margin: "0 2rem 2rem 0",
                padding: "1.5rem",
                position: "relative",
              }}
              className={"h-100"}
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => setOpen(false)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
                aria-label="Close"
              >
                ×
              </Button>
              <CardHeader>
                <CardTitle>Tell Jammie</CardTitle>
                <CardDescription>
                  {/* Chat content goes here */}
                  {/* <p>
                    Jammie hahaha geddit. <br />
                    this is an AI form bc why tf not. I want to know what you
                    would use, and more importantly what you would like to see
                    included + use. lmk thoughts!
                  </p>
                  <p>- Tin + stagemates team.</p> */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <iframe
                  src="https://deformity.ai/d/w28pfTDPXxIA"
                  // class="deformity-embed"
                  style={{
                    display: "block",
                    width: "100%",
                    border: "0",
                    minHeight: "60vh",
                  }}
                  loading="lazy"
                  allow="microphone"
                ></iframe>
              </CardContent>
            </Card>
          </Card>
        </>
      )}
    </>
  );
};

export default AskJamie;
