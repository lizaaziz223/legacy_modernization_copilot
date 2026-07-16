import { Coffee, Cog, Hammer, Box, Wrench, Leaf, Rocket, FileCode2, FileText, Database, Server, Package, Braces } from 'lucide-react';
import { DetectedAttributeTile } from './detected-attribute-tile';
import { DetectedListItemCard } from './detected-list-item-card';
import { ConfidenceBar } from './confidence-bar';
import { TechnologyDetectionResult, TechnologyType } from '@/types';

const TECHNOLOGY_LABELS: Record<TechnologyType, string> = {
  SERVLET: 'Servlet',
  JSP: 'JSP',
  SPRING_MVC: 'Spring MVC',
  SPRING_XML: 'Spring XML',
  JDBC: 'JDBC',
  HIBERNATE: 'Hibernate',
  EJB: 'EJB',
  COBOL: 'COBOL',
  JCL: 'JCL',
  STRUTS: 'Struts',
};

interface TechnologyDetectionPanelProps {
  result: TechnologyDetectionResult;
}

/**
 * The Technology Summary Card: every build/runtime/framework attribute the
 * detection agent could infer, each with its own confidence score and an
 * expandable explanation of exactly how it was detected.
 */
export function TechnologyDetectionPanel({ result }: TechnologyDetectionPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold">Technology Summary</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Every value below includes a confidence score - expand &quot;How was this detected?&quot; to see the
          evidence.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <DetectedAttributeTile label="Java Version" icon={Coffee} attribute={result.javaVersion} />
          <DetectedAttributeTile label="JDK Version" icon={Cog} attribute={result.jdkVersion} />
          <DetectedAttributeTile label="Build Tool" icon={Hammer} attribute={result.buildTool} />
          <DetectedAttributeTile label="Maven Version" icon={Box} attribute={result.mavenVersion} />
          <DetectedAttributeTile label="Gradle Version" icon={Wrench} attribute={result.gradleVersion} />
          <DetectedAttributeTile label="Spring Version" icon={Leaf} attribute={result.springVersion} />
          <DetectedAttributeTile label="Spring Boot Version" icon={Rocket} attribute={result.springBootVersion} />
          <DetectedAttributeTile label="Servlet Version" icon={FileCode2} attribute={result.servletVersion} />
          <DetectedAttributeTile label="JSP Version" icon={FileText} attribute={result.jspVersion} />
          <DetectedAttributeTile label="Hibernate Version" icon={Database} attribute={result.hibernateVersion} />
          <DetectedAttributeTile label="Application Server" icon={Server} attribute={result.applicationServer} />
          <DetectedAttributeTile label="Packaging" icon={Package} attribute={result.packaging} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold">Configuration Style</h3>
        {result.configurationStyles.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No Spring configuration style detected.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.configurationStyles.map((style) => (
              <DetectedListItemCard key={style.value} icon={Braces} attribute={style} />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold">Database(s)</h3>
        {result.databases.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No database usage detected.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.databases.map((db) => (
              <DetectedListItemCard key={db.value} icon={Database} attribute={db} />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold">Detected Technologies</h3>
        {result.detectedTechnologies.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No known legacy technologies were detected in this project.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {result.detectedTechnologies.map((detected) => (
              <ConfidenceBar
                key={detected.technology}
                label={TECHNOLOGY_LABELS[detected.technology]}
                score={detected.confidenceScore}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
