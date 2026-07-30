/**
 * Renders for any nav leaf whose delivery phase hasn't landed yet.
 *
 * The point is that no link in the rail is ever dead. It states what the screen
 * will do (from navConfig) and which phase brings it, so clicking around the
 * console is a tour of the plan rather than a series of blank pages.
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Hammer, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { leafForPath, groupForPath, DELIVERED_THROUGH } from '../layouts/navConfig';

const PHASE_NAME: Record<number, string> = {
  1: 'Shell & overview',
  2: 'Schools',
  3: 'People & access',
  4: 'Communication',
  5: 'Configuration',
  6: 'Billing',
  7: 'Tools & reports',
};

export const PlannedPage: React.FC = () => {
  const { pathname } = useLocation();
  const { getUserRole } = useAuth();
  const role = getUserRole();
  const leaf = leafForPath(role, pathname);
  const group = groupForPath(role, pathname);
  const phase = leaf?.phase ?? 2;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line bg-surfaceinset px-6 py-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slatesoft">
            {group} — Phase {phase}
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-ink">
            {leaf?.label || 'Screen'}
          </h1>
        </div>

        <div className="px-6 py-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-signal/10 text-signal">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-ink">
                Scheduled for Phase {phase} — {PHASE_NAME[phase]}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slatesoft">
                {leaf?.blurb || 'This screen is part of the build plan and has not been implemented yet.'}
              </p>
              <p className="mt-4 text-sm text-slatesoft">
                Phases 1 to {DELIVERED_THROUGH} are live. The navigation is complete from the start on purpose,
                so you can walk the whole product and see exactly what is coming.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              to={role === 'super_admin' || role === 'developer' ? '/platform/dashboard' : `/${role.replace('_', '-')}/dashboard`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
