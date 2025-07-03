"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  Shield,
  Play,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Download,
  RefreshCw,
  Server,
  Lock,
  Code,
  Activity,
  Zap,
} from "lucide-react";

// Environment protection - only show in development
const isDevelopment = process.env.NODE_ENV === "development";

interface TestResult {
  id: string;
  name: string;
  category: string;
  endpoint?: string;
  method?: string;
  status: "idle" | "running" | "success" | "error";
  responseTime?: number;
  response?: unknown;
  error?: string;
  timestamp?: Date;
}

interface SystemHealth {
  database: "healthy" | "error" | "unknown";
  authentication: "healthy" | "error" | "unknown";
  apis: "healthy" | "error" | "unknown";
  environment: "development" | "production" | "unknown";
}

const testCategories = {
  auth: {
    name: "Authentication",
    icon: Shield,
    color: "blue",
    tests: [
      {
        id: "auth-status",
        name: "User Authentication Status",
        endpoint: "/api/debug",
        method: "GET",
      },
      {
        id: "auth-user-creation",
        name: "User Creation Process",
        endpoint: "/api/debug",
        method: "GET",
      },
    ],
  },
  apis: {
    name: "API Endpoints",
    icon: Server,
    color: "green",
    tests: [
      {
        id: "api-appointments-today",
        name: "Today Appointments",
        endpoint: "/api/appointments?period=today",
        method: "GET",
      },
      {
        id: "api-appointments-week",
        name: "Week Appointments",
        endpoint: "/api/appointments?period=week",
        method: "GET",
      },
      {
        id: "api-appointments-month",
        name: "Month Appointments",
        endpoint: "/api/appointments?period=month",
        method: "GET",
      },
      {
        id: "api-customers",
        name: "Customers List",
        endpoint: "/api/customers",
        method: "GET",
      },
      {
        id: "api-notifications",
        name: "Notifications",
        endpoint: "/api/notifications",
        method: "GET",
      },
      {
        id: "api-payments",
        name: "Payments",
        endpoint: "/api/payments",
        method: "GET",
      },
      {
        id: "api-landing-page",
        name: "Landing Page Config",
        endpoint: "/api/landing-page",
        method: "GET",
      },
      { id: "api-plans", name: "Plans", endpoint: "/api/plans", method: "GET" },
    ],
  },
  database: {
    name: "Database Operations",
    icon: Database,
    color: "purple",
    tests: [
      {
        id: "db-connection",
        name: "Database Connection",
        endpoint: "/api/debug",
        method: "GET",
      },
      {
        id: "db-user-count",
        name: "User Count",
        endpoint: "/api/debug",
        method: "GET",
      },
      {
        id: "db-data-integrity",
        name: "Data Integrity Check",
        endpoint: "/api/debug",
        method: "GET",
      },
    ],
  },
  performance: {
    name: "Performance Tests",
    icon: Zap,
    color: "yellow",
    tests: [
      {
        id: "perf-api-speed",
        name: "API Response Speed",
        endpoint: "/api/debug",
        method: "GET",
      },
      {
        id: "perf-concurrent",
        name: "Concurrent Requests",
        endpoint: "/api/debug",
        method: "GET",
      },
    ],
  },
};

export default function DebugPage() {
  // React Hooks must be called before any early returns
  const { user, isLoaded } = useUser();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: "unknown",
    authentication: "unknown",
    apis: "unknown",
    environment: "unknown",
  });
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("auth");
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    checkSystemHealth();
    addLog("🚀 Debug Console Initialized");
  }, []);

  // Environment protection - after hooks
  if (!isDevelopment) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Debug tools are only available in development environment.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    checkSystemHealth();
    addLog("🚀 Debug Console Initialized");
  }, []);

  const addLog = (
    message: string,
    type: "info" | "success" | "error" | "warning" = "info"
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
    }[type];

    setLogs((prev) => [
      `[${timestamp}] ${emoji} ${message}`,
      ...prev.slice(0, 99),
    ]);
  };

  const checkSystemHealth = async () => {
    addLog("🔍 Checking system health...");

    // Check environment
    const env = process.env.NODE_ENV || "unknown";
    setSystemHealth((prev) => ({ ...prev, environment: env as any }));

    // Check authentication
    if (isLoaded) {
      if (user) {
        setSystemHealth((prev) => ({ ...prev, authentication: "healthy" }));
        addLog("✅ Authentication: Healthy", "success");
      } else {
        setSystemHealth((prev) => ({ ...prev, authentication: "error" }));
        addLog("❌ Authentication: No user found", "error");
      }
    }

    // Quick API health check
    try {
      const response = await fetch("/api/debug");
      if (response.ok) {
        setSystemHealth((prev) => ({
          ...prev,
          database: "healthy",
          apis: "healthy",
        }));
        addLog("✅ APIs: Healthy", "success");
        addLog("✅ Database: Healthy", "success");
      } else {
        setSystemHealth((prev) => ({ ...prev, apis: "error" }));
        addLog("❌ APIs: Error detected", "error");
      }
    } catch (error) {
      setSystemHealth((prev) => ({
        ...prev,
        database: "error",
        apis: "error",
      }));
      addLog("❌ System Health Check Failed", "error");
    }
  };

  const runTest = async (testConfig: any): Promise<TestResult> => {
    const startTime = Date.now();
    addLog(`🧪 Running test: ${testConfig.name}`);

    try {
      const response = await fetch(testConfig.endpoint, {
        method: testConfig.method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseTime = Date.now() - startTime;
      let responseData;

      try {
        responseData = await response.json();
      } catch {
        responseData = { error: "Invalid JSON response" };
      }

      const result: TestResult = {
        id: testConfig.id,
        name: testConfig.name,
        category: selectedCategory,
        endpoint: testConfig.endpoint,
        method: testConfig.method,
        status: response.ok ? "success" : "error",
        responseTime,
        response: responseData,
        timestamp: new Date(),
        ...(response.ok
          ? {}
          : { error: `HTTP ${response.status}: ${response.statusText}` }),
      };

      if (response.ok) {
        addLog(`✅ ${testConfig.name}: ${responseTime}ms`, "success");
      } else {
        addLog(`❌ ${testConfig.name}: Failed (${response.status})`, "error");
      }

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      addLog(`❌ ${testConfig.name}: Network error`, "error");

      return {
        id: testConfig.id,
        name: testConfig.name,
        category: selectedCategory,
        endpoint: testConfig.endpoint,
        method: testConfig.method,
        status: "error",
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  };

  const runSingleTest = async (testConfig: any) => {
    // Set test as running
    setTests((prev) => {
      const updated = prev.filter((t) => t.id !== testConfig.id);
      return [
        ...updated,
        {
          ...testConfig,
          status: "running" as const,
          category: selectedCategory,
        },
      ];
    });

    const result = await runTest(testConfig);

    setTests((prev) => {
      const updated = prev.filter((t) => t.id !== testConfig.id);
      return [...updated, result];
    });
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    addLog("🚀 Starting comprehensive test suite...");

    const allTests = Object.values(testCategories).flatMap((category) =>
      category.tests.map((test) => ({
        ...test,
        category: category.name.toLowerCase(),
      }))
    );

    for (const testConfig of allTests) {
      await runSingleTest({ ...testConfig, category: testConfig.category });
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setIsRunningAll(false);
    addLog("🎉 All tests completed!", "success");
  };

  const clearResults = () => {
    setTests([]);
    setLogs([]);
    addLog("🧹 Results cleared");
  };

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      systemHealth,
      tests: tests.map((test) => ({
        ...test,
        timestamp: test.timestamp?.toISOString(),
      })),
      logs,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-results-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addLog("📁 Results exported", "success");
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "running":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500 bg-green-50";
      case "error":
        return "text-red-500 bg-red-50";
      default:
        return "text-yellow-500 bg-yellow-50";
    }
  };

  const getCurrentCategoryTests = () => {
    return (
      testCategories[selectedCategory as keyof typeof testCategories]?.tests ||
      []
    );
  };

  const getTestResults = (categoryTests: any[]) => {
    return categoryTests.map(
      (test) =>
        tests.find((t) => t.id === test.id) || {
          ...test,
          status: "idle" as const,
        }
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading debug console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Code className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Development Debug Console
                </h1>
                <p className="text-sm text-gray-500">
                  Professional debugging & monitoring tools
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    systemHealth.environment === "development"
                      ? "bg-green-400"
                      : "bg-red-400"
                  }`}
                ></div>
                <span className="text-sm text-gray-600">Development Mode</span>
              </div>

              {user && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user.firstName?.[0] || "U"}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">
                    {user.firstName || "User"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* System Health */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                System Health
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(
                      systemHealth.database
                    )}`}
                  >
                    {systemHealth.database}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Authentication</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(
                      systemHealth.authentication
                    )}`}
                  >
                    {systemHealth.authentication}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">APIs</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(
                      systemHealth.apis
                    )}`}
                  >
                    {systemHealth.apis}
                  </span>
                </div>
              </div>

              <button
                onClick={checkSystemHealth}
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Refresh Health Check
              </button>
            </div>

            {/* Test Categories */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Test Categories
              </h3>

              <div className="space-y-2">
                {Object.entries(testCategories).map(([key, category]) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory === key;

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isSelected
                          ? `bg-${category.color}-50 text-${category.color}-700 border border-${category.color}-200`
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                      <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {category.tests.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-2">
                <button
                  onClick={runAllTests}
                  disabled={isRunningAll}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isRunningAll ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>{isRunningAll ? "Running..." : "Run All Tests"}</span>
                </button>

                <button
                  onClick={clearResults}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Clear Results
                </button>

                <button
                  onClick={exportResults}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Results</span>
                </button>

                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className={`w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    showLogs
                      ? "bg-yellow-600 text-white"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {showLogs ? "Hide Logs" : "Show Logs"} ({logs.length})
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Category Tests */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const category =
                        testCategories[
                          selectedCategory as keyof typeof testCategories
                        ];
                      const IconComponent = category?.icon || Settings;
                      return (
                        <>
                          <IconComponent className="h-6 w-6 text-gray-600" />
                          <h2 className="text-xl font-semibold text-gray-900">
                            {category?.name || "Unknown Category"}
                          </h2>
                        </>
                      );
                    })()}
                  </div>

                  <div className="text-sm text-gray-500">
                    {getCurrentCategoryTests().length} tests available
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-4">
                  {getTestResults(getCurrentCategoryTests()).map((test) => (
                    <div
                      key={test.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {test.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {test.method} {test.endpoint}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {test.responseTime && (
                            <span className="text-sm text-gray-600">
                              {test.responseTime}ms
                            </span>
                          )}

                          <button
                            onClick={() => runSingleTest(test)}
                            disabled={test.status === "running"}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {test.status === "running"
                              ? "Running..."
                              : "Run Test"}
                          </button>
                        </div>
                      </div>

                      {test.status === "error" && test.error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-700">{test.error}</p>
                        </div>
                      )}

                      {test.status === "success" && test.response && (
                        <div className="mt-3">
                          <details className="cursor-pointer">
                            <summary className="text-sm text-gray-600 hover:text-gray-800">
                              View Response Data
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-xs overflow-auto max-h-48">
                              {JSON.stringify(test.response, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Logs */}
            {showLogs && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Debug Logs
                  </h3>
                </div>

                <div className="p-6">
                  <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
                    <div className="space-y-1 font-mono text-sm">
                      {logs.length === 0 ? (
                        <p className="text-gray-400">No logs yet...</p>
                      ) : (
                        logs.map((log, index) => (
                          <div key={index} className="text-green-400">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
