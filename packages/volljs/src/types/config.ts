/**
 * Core configuration types for Voll.js routes and middleware
 */

import { JSONSchemaType } from "ajv";
import { HttpMethod } from ".";
import { VollNextFunction, VollRequest, VollResponse } from "./http";

/**
 * Simple schema type that accepts either a JSON Schema or a plain object
 */
export type SimpleSchema = JSONSchemaType<any> | Record<string, any>;

/**
 * Route schema configuration for request validation
 */
export interface RouteSchema {
    /** Validates request body against this schema */
    body?: JSONSchemaType<any> | Record<string, any>;
    /** Validates URL parameters against this schema */
    params?: JSONSchemaType<any> | Record<string, any>;
    /** Validates query parameters against this schema */
    query?: JSONSchemaType<any> | Record<string, any>;
    /** Validates request headers against this schema */
    headers?: JSONSchemaType<any> | Record<string, any>;
}

/**
 * Middleware function signature for route handlers
 * 
 * Represents an async function that can be used as middleware in the request processing pipeline.
 * Middleware functions can perform operations like authentication, logging, request modification,
 * and response handling.
 * 
 * @param req - The Voll request object containing details about the incoming HTTP request
 * @param res - The Voll response object used to send responses back to the client
 * @param next - Function to call the next middleware in the chain. Must be called to continue
 *               processing unless the middleware intends to end the request-response cycle.
 *               Returns a Promise that resolves when the next middleware completes.
 * 
 * @returns A Promise that resolves when the middleware processing is complete
 */
export type MiddlewareFunction = (
    req: VollRequest,
    res: VollResponse,
    next: VollNextFunction
) => Promise<void>;

/**
 * Configuration options for individual routes
 */
export interface RouteOptions {
    /** Schema validation rules for the route */
    schema?: RouteSchema;
    /** Array of middleware functions to execute */
    middleware?: MiddlewareFunction[];
}

/**
 * HTTP method-specific route options
 */
export type MethodOptions = {
    [key in HttpMethod]?: RouteOptions;
};

/**
 * Main Voll configuration type that can be either route options or method-specific options
 */
export type VollConfig = RouteOptions | MethodOptions;
