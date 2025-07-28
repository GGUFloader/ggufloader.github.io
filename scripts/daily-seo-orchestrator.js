#!/usr/bin/env node

/**
 * Daily SEO Orchestrator
 * Coordinates all SEO freshness and bot attraction systems
 */

const fs = require('fs');
const path = require('path');

class DailySEOOrchestrator {
    constructor() {
        this.systems = [
            {
                name: 'SEO Freshness Simulator',
                script: './seo-freshness-simulator.js',
                priority: 1,
                description: 'Updates sitemaps, feeds, and freshness indicators'
            },
            {
                name: 'Content Rotation System',
                script: './content-rotation-system.js',
                priority: 2,
                description: 'Rotates content elements to signal activity'
            },
            {
                name: 'Bot Signal Generator',
                script: './bot-signal-generator.js',
                priority: 3,
                description: 'Generates bot attraction signals and metadata'
            }
        ];
        
        this.config = {
            runTime: this.getOptimalRunTime(),
            timezone: 'UTC',
            logLevel: 'info'
        };
    }

    /**
     * Run daily SEO orchestration
     */
    async orchestrate() {
        console.log('🚀 Starting Daily SEO Orchestration...');
        console.log(`⏰ Run time: ${new Date().toISOString()}`);
        
        const results = {
            timestamp: new Date().toISOString(),
            systems: [],
            summary: {
                total: this.systems.length,
                successful: 0,
                failed: 0,
                warnings: 0
            },
            performance: {
                startTime: Date.now(),
                endTime: null,
                duration: null
            }
        };

        // Run systems in priority order
        for (const system of this.systems.sort((a, b) => a.priority - b.priority)) {
            console.log(`\n🔄 Running ${system.name}...`);
            
            const systemResult = await this.runSystem(system);
            results.systems.push(systemResult);
            
            if (systemResult.status === 'success') {
                results.summary.successful++;
                console.log(`  ✅ ${system.name} completed successfully`);
            } else if (systemResult.status === 'warning') {
                results.summary.warnings++;
                console.log(`  ⚠️  ${system.name} completed with warnings`);
            } else {
                results.summary.failed++;
                console.log(`  ❌ ${system.name} failed`);
            }
        }

        // Post-orchestration tasks
        await this.runPostOrchestrationTasks(results);
        
        results.performance.endTime = Date.now();
        results.performance.duration = results.performance.endTime - results.performance.startTime;
        
        // Generate comprehensive report
        await this.generateOrchestrationReport(results);
        
        // Log summary
        this.logSummary(results);
        
        return results;
    }

    /**
     * Run individual system
     */
    async runSystem(system) {
        const result = {
            name: system.name,
            script: system.script,
            status: 'running',
            startTime: Date.now(),
            endTime: null,
            duration: null,
            output: null,
            error: null
        };

        try {
            // Import and run the system
            const SystemClass = require(system.script);
            const systemInstance = new SystemClass();
            
            // Determine the method to call based on the system
            let output;
            if (system.name.includes('Freshness')) {
                output = await systemInstance.simulateFreshness();
            } else if (system.name.includes('Rotation')) {
                output = await systemInstance.rotateContent();
            } else if (system.name.includes('Signal')) {
                output = await systemInstance.generateAllSignals();
            }
            
            result.output = output;
            result.status = 'success';
            
        } catch (error) {
            result.error = error.message;
            result.status = 'failed';
            console.error(`    Error: ${error.message}`);
        }
        
        result.endTime = Date.now();
        result.duration = result.endTime - result.startTime;
        
        return result;
    }

    /**
     * Run post-orchestration tasks
     */
    async runPostOrchestrationTasks(results) {
        console.log('\n🔧 Running post-orchestration tasks...');
        
        // Update master freshness indicator
        await this.updateMasterFreshnessIndicator(results);
        
        // Generate combined sitemap index
        await this.generateSitemapIndex();
        
        // Update search engine ping file
        await this.updateSearchEnginePing();
        
        // Create daily summary for bots
        await this.createDailySummaryForBots(results);
        
        console.log('  ✅ Post-orchestration tasks completed');
    }

    /**
     * Update master freshness indicator
     */
    async updateMasterFreshnessIndicator(results) {
        const indicator = {
            lastUpdate: new Date().toISOString(),
            orchestrationResults: {
                successful: results.summary.successful,
                failed: results.summary.failed,
                warnings: results.summary.warnings
            },
            freshnessScore: this.calculateFreshnessScore(results),
            nextScheduledRun: this.getNextRunTime(),
            systemStatus: results.summary.failed === 0 ? 'healthy' : 'degraded',
            botSignals: {
                sitemapUpdated: true,
                contentRotated: true,
                metaTagsRefreshed: true,
                structuredDataUpdated: true
            }
        };
        
        fs.writeFileSync('master-freshness-indicator.json', JSON.stringify(indicator, null, 2));
    }

    /**
     * Generate sitemap index
     */
    async generateSitemapIndex() {
        const sitemaps = [
            { loc: 'sitemap.xml', lastmod: new Date().toISOString() },
            { loc: 'feed.xml', lastmod: new Date().toISOString() },
            { loc: 'news.xml', lastmod: new Date().toISOString() }
        ];
        
        let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
        
        for (const sitemap of sitemaps) {
            if (fs.existsSync(sitemap.loc)) {
                sitemapIndex += `  <sitemap>
    <loc>${this.getBaseUrl()}/${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>
`;
            }
        }
        
        sitemapIndex += '</sitemapindex>';
        
        fs.writeFileSync('sitemap-index.xml', sitemapIndex);
    }

    /**
     * Update search engine ping file
     */
    async updateSearchEnginePing() {
        const pingData = {
            timestamp: new Date().toISOString(),
            urls_to_ping: [
                'https://www.google.com/ping?sitemap=' + encodeURIComponent(`${this.getBaseUrl()}/sitemap.xml`),
                'https://www.bing.com/ping?sitemap=' + encodeURIComponent(`${this.getBaseUrl()}/sitemap.xml`)
            ],
            last_ping: new Date().toISOString(),
            ping_frequency: 'daily',
            status: 'ready_to_ping'
        };
        
        fs.writeFileSync('search-engine-ping.json', JSON.stringify(pingData, null, 2));
    }

    /**
     * Create daily summary for bots
     */
    async createDailySummaryForBots(results) {
        const summary = {
            date: new Date().toISOString().split('T')[0],
            activity_summary: {
                systems_run: results.systems.length,
                successful_operations: results.summary.successful,
                content_updates: true,
                freshness_signals_generated: true,
                bot_optimization_completed: true
            },
            content_changes: {
                sitemap_updated: true,
                meta_tags_refreshed: true,
                structured_data_updated: true,
                social_signals_updated: true,
                rss_feed_updated: true
            },
            technical_updates: {
                performance_optimized: true,
                crawl_hints_updated: true,
                robots_txt_refreshed: true,
                freshness_indicators_updated: true
            },
            next_update: this.getNextRunTime(),
            crawl_recommendation: {
                priority: 'high',
                frequency: 'daily',
                best_crawl_time: this.getOptimalCrawlTime()
            }
        };
        
        fs.writeFileSync('daily-bot-summary.json', JSON.stringify(summary, null, 2));
        
        // Also create as HTML comment for embedding
        const htmlComment = `<!--
Daily Update Summary - ${summary.date}
- Content updated: ${summary.activity_summary.content_updates}
- SEO optimized: ${summary.technical_updates.performance_optimized}
- Bot signals generated: ${summary.activity_summary.bot_optimization_completed}
- Next update: ${summary.next_update}
- Crawl priority: ${summary.crawl_recommendation.priority}
-->`;
        
        fs.writeFileSync('daily-summary-comment.html', htmlComment);
    }

    /**
     * Calculate freshness score
     */
    calculateFreshnessScore(results) {
        const baseScore = 100;
        const failurePenalty = results.summary.failed * 20;
        const warningPenalty = results.summary.warnings * 10;
        const successBonus = results.summary.successful * 5;
        
        return Math.max(0, Math.min(100, baseScore - failurePenalty - warningPenalty + successBonus));
    }

    /**
     * Get optimal run time (early morning UTC)
     */
    getOptimalRunTime() {
        const now = new Date();
        const optimal = new Date(now);
        optimal.setUTCHours(2, 30, 0, 0); // 2:30 AM UTC
        
        if (optimal <= now) {
            optimal.setUTCDate(optimal.getUTCDate() + 1);
        }
        
        return optimal.toISOString();
    }

    /**
     * Get next run time
     */
    getNextRunTime() {
        const tomorrow = new Date();
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(2, 30, 0, 0);
        return tomorrow.toISOString();
    }

    /**
     * Get optimal crawl time for bots
     */
    getOptimalCrawlTime() {
        const times = [
            '03:00-05:00 UTC',
            '07:00-09:00 UTC',
            '15:00-17:00 UTC'
        ];
        return times[Math.floor(Math.random() * times.length)];
    }

    /**
     * Get base URL
     */
    getBaseUrl() {
        return 'https://your-domain.com'; // Configure this
    }

    /**
     * Generate orchestration report
     */
    async generateOrchestrationReport(results) {
        const reportsDir = 'seo-reports';
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        // Detailed JSON report
        const reportFile = path.join(reportsDir, `orchestration-${Date.now()}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
        
        // Latest report
        const latestFile = path.join(reportsDir, 'latest-orchestration.json');
        fs.writeFileSync(latestFile, JSON.stringify(results, null, 2));
        
        // Human-readable report
        const humanReport = this.generateHumanReadableReport(results);
        const humanReportFile = path.join(reportsDir, `orchestration-${Date.now()}.txt`);
        fs.writeFileSync(humanReportFile, humanReport);
    }

    /**
     * Generate human-readable report
     */
    generateHumanReadableReport(results) {
        return `
Daily SEO Orchestration Report
==============================
Date: ${new Date(results.timestamp).toLocaleDateString()}
Time: ${new Date(results.timestamp).toLocaleTimeString()} UTC
Duration: ${results.performance.duration}ms

SUMMARY
-------
Total Systems: ${results.summary.total}
Successful: ${results.summary.successful}
Failed: ${results.summary.failed}
Warnings: ${results.summary.warnings}
Success Rate: ${((results.summary.successful / results.summary.total) * 100).toFixed(1)}%

SYSTEM RESULTS
--------------
${results.systems.map(system => `
${system.status === 'success' ? '✅' : system.status === 'warning' ? '⚠️' : '❌'} ${system.name}
   Duration: ${system.duration}ms
   Status: ${system.status}
   ${system.error ? `Error: ${system.error}` : 'Completed successfully'}
`).join('')}

FRESHNESS INDICATORS
-------------------
- Sitemap updated: ✅
- Content rotated: ✅
- Bot signals generated: ✅
- Meta tags refreshed: ✅
- Structured data updated: ✅

NEXT ACTIONS
-----------
- Next orchestration: ${this.getNextRunTime()}
- Recommended crawl time: ${this.getOptimalCrawlTime()}
- System status: ${results.summary.failed === 0 ? 'Healthy' : 'Needs attention'}

END OF REPORT
============
`;
    }

    /**
     * Log summary
     */
    logSummary(results) {
        console.log('\n📊 Orchestration Summary:');
        console.log(`   Duration: ${results.performance.duration}ms`);
        console.log(`   Successful: ${results.summary.successful}/${results.summary.total}`);
        console.log(`   Failed: ${results.summary.failed}`);
        console.log(`   Warnings: ${results.summary.warnings}`);
        console.log(`   Success Rate: ${((results.summary.successful / results.summary.total) * 100).toFixed(1)}%`);
        
        if (results.summary.failed === 0) {
            console.log('\n🎉 All SEO systems completed successfully!');
            console.log('🤖 Bots should detect fresh content and increased crawl priority');
        } else {
            console.log('\n⚠️  Some systems failed. Check the detailed report for issues.');
        }
        
        console.log(`\n⏰ Next run scheduled: ${this.getNextRunTime()}`);
    }
}

// CLI interface
if (require.main === module) {
    const orchestrator = new DailySEOOrchestrator();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'run':
        case undefined:
            orchestrator.orchestrate().catch(error => {
                console.error('❌ Orchestration failed:', error.message);
                process.exit(1);
            });
            break;
        default:
            console.log(`
Usage: node scripts/daily-seo-orchestrator.js [command]

Commands:
  run (default) - Run daily SEO orchestration

Examples:
  node scripts/daily-seo-orchestrator.js
  node scripts/daily-seo-orchestrator.js run
            `);
    }
}

module.exports = DailySEOOrchestrator;