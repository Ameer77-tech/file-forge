import { regex } from "./regex.js";

export function updateSecurity(analysis, line) {
  analysis.detections.emails += (line.match(regex.email) ?? []).length;

  analysis.detections.urls += (line.match(regex.url) ?? []).length;

  analysis.detections.ipv4 += (line.match(regex.ipv4) ?? []).length;

  analysis.detections.ipv6 += (line.match(regex.ipv6) ?? []).length;

  analysis.detections.phoneNumbers += (line.match(regex.phone) ?? []).length;

  analysis.detections.uuids += (line.match(regex.uuid) ?? []).length;

  analysis.detections.jwtTokens += (line.match(regex.jwt) ?? []).length;

  analysis.detections.bearerTokens += (line.match(regex.bearer) ?? []).length;

  analysis.detections.apiKeys += (line.match(regex.apiKey) ?? []).length;

  analysis.detections.awsKeys += (line.match(regex.awsKey) ?? []).length;

  analysis.detections.mongodbIds += (line.match(regex.mongodbId) ?? []).length;

  if (
    analysis.detections.jwtTokens ||
    analysis.detections.bearerTokens ||
    analysis.detections.apiKeys ||
    analysis.detections.awsKeys
  ) {
    analysis.security.containsSecrets = true;
  }

  const ips = line.match(regex.ipv4) ?? [];

  for (const ip of ips) {
    analysis._internal.ipMap.set(
      ip,
      (analysis._internal.ipMap.get(ip) || 0) + 1,
    );
  }
}

export function finalizeSecurity(analysis) {
  analysis.topIPs = [...analysis._internal.ipMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ip, count]) => ({
      ip,
      count,
    }));
}
