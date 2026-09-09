"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

const BASE_WAITLIST_COUNT = 3;
const BASE_WAITLIST_AT = Date.parse("2026-09-09T15:08:00.000Z");
const HOURLY_INCREMENTS = [1, 2, 3] as const;

export default function Home() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [waitlistCount, setWaitlistCount] = useState(BASE_WAITLIST_COUNT);

  useEffect(() => {
    function refreshCount() {
      setWaitlistCount(calculateWaitlistCount(Date.now()));
    }

    refreshCount();
    const timer = window.setInterval(refreshCount, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("Saving your spot...");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, website }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Unable to join the waiting list.");
      }

      setStatus("success");
      setMessage(data.message || "You're on the waiting list. We will email you soon.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="page-shell">
      <section className="waitlist" aria-labelledby="brand-title">
        <h1 id="brand-title" className="sr-only">
          nativeship
        </h1>

        <a href="/" aria-label="nativeship home" className="brand-link">
          <Image
            className="logo"
            src="/nativeship-logo.png"
            alt="nativeship"
            width={900}
            height={272}
            priority
          />
        </a>

        <p className="intro">
          <a href="https://x.com/KelisShekhaliya" target="_blank" rel="noreferrer">
            Kelis
          </a>{" "}
          and{" "}
          <a href="https://x.com/bhshekhaliya" target="_blank" rel="noreferrer">
            Bhavy
          </a>{" "}
          are building something useful here...
        </p>

        <form className="waitlist-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="email">
            Email address
          </label>

          <div className="honeypot" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          <div className="form-row">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              disabled={status === "loading"}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Joining..." : "Join Waitlist"}
            </button>
          </div>

          <p className={`form-message ${status}`} aria-live="polite">
            {message || (
              <>
                First come, first serve. There are <strong>{waitlistCount.toLocaleString()}</strong> people on the
                waitlist already.
              </>
            )}
          </p>
        </form>
      </section>
    </main>
  );
}

function calculateWaitlistCount(now: number) {
  const elapsedHours = Math.max(0, Math.floor((now - BASE_WAITLIST_AT) / 3_600_000));
  let count = BASE_WAITLIST_COUNT;

  for (let hour = 1; hour <= elapsedHours; hour += 1) {
    count += HOURLY_INCREMENTS[pickIncrementIndex(hour)];
  }

  return count;
}

function pickIncrementIndex(hour: number) {
  return Math.abs(Math.sin(hour * 9301 + 49297) * 233280) % HOURLY_INCREMENTS.length | 0;
}
