import { DbItem } from '../models/core/db.item';
import * as config from './database.config.json';
require('dotenv').config();
var mysql = require('mysql2/promise');

console.log("Connecting to mysql database...");
var connection = mysql.createPool({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});

console.log("Connecting to mysql database sucessfull!");

export async function query<T>(query: string): Promise<T[]> {
	if (config.log) {
		console.log(query);
	}
	return (await connection.query(query))[0];
}
export async function fetch<T>(table: string, filter: DbItem): Promise<T[]> {
	return query<T>('SELECT * FROM ' + table + ' WHERE ' + filter.whereString() + ';');
}
export async function fetchSimilar<T>(table: string, filter: DbItem): Promise<T[]> {
	return query<T>('SELECT * FROM ' + table + ' WHERE ' + filter.whereSimilarString() + ';');
}
export async function fetchAll<T>(table: string): Promise<T[]> {
	return query<T>('SELECT * FROM ' + table + ';');
}
export async function insert<T>(table: string, filter: DbItem): Promise<T[]> {
	return query<T>('INSERT INTO ' + table + ' (' + filter.listKeys() + ') VALUES (' + filter.listValues() + ');');
}
export async function update<T>(table: string, filter: DbItem): Promise<T[]> {
	return query<T>('UPDATE ' + table + ' SET ' + filter.valuesToString() + ' WHERE id=\'' + filter.id + '\';');
}
export async function deleteItem<T>(table: string, filter: DbItem): Promise<T[]> {
	return query<T>('DELETE FROM ' + table + ' WHERE ' + filter.whereString() + ';');
}
export async function innerJoin<T>(t1: string, t2: string, t1key: string, t2key: string, filter: DbItem): Promise<T[]> {
	return query<T>('SELECT * FROM ' + t1 + ' AS t1 INNER JOIN ' + t2 + ' as t2 ON t1.' + t1key + ' = t2.' + t2key + ' WHERE ' + filter.whereString() + ';');
}
export async function leftJoin<T>(t1: string, t2: string, t1key: string, t2key: string, filter: DbItem): Promise<T[]> {
	return query<T>('SELECT * FROM ' + t1 + ' AS t1 LEFT JOIN ' + t2 + ' as t2 ON t1.' + t1key + ' = t2.' + t2key + ' WHERE ' + filter.whereString() + ';');
}