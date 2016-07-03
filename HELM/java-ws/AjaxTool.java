/**
 * *****************************************************************************
 * Copyright C 2015, The Pistoia Alliance
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *****************************************************************************
 */
package org.helm.rest;

import javax.ws.rs.*;
import javax.ws.rs.core.*;
import com.sun.jersey.multipart.FormDataParam;
import java.io.*;
import org.json.JSONObject;
import org.apache.commons.io.IOUtils;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.ArrayUtils;
import javax.servlet.annotation.MultipartConfig;

@Path("/ajaxtool")
public class AjaxTool {
    
    // http://www.mkyong.com/webservices/jax-rs/file-upload-example-in-jersey/
    
    Database monomers = null;
    Database rules = null;

    @GET
    //@Consumes(MediaType.MULTIPART_FORM_DATA)
    @Consumes({MediaType.APPLICATION_JSON, MediaType.APPLICATION_FORM_URLENCODED, MediaType.TEXT_HTML, 
        MediaType.TEXT_PLAIN, MediaType.MULTIPART_FORM_DATA})
    @Produces("text/plain")
    @Path("/get")
    public Response CmdGet(@Context HttpServletRequest request) {
        Map<String, String> args = getQueryParameters(request);
        try {
            return OnCmd(args.get("cmd"), args, request);
        }
        catch (Exception e) {
            return Response.status(Response.Status.OK).entity(wrapAjaxError("ERROR: " + e.getMessage() + ", " + GetTrace(e))).build();
        }
    }    
    
    @POST
    //@Consumes(MediaType.MULTIPART_FORM_DATA)
    @Consumes({MediaType.APPLICATION_JSON, MediaType.APPLICATION_FORM_URLENCODED, MediaType.TEXT_HTML, 
        MediaType.TEXT_PLAIN, MediaType.MULTIPART_FORM_DATA})
    @Produces({"text/plain", "text/html", "application/unknown"})
    @Path("/post")
    public Response CmdPost(@Context HttpServletRequest request) {
        Map<String, String> args = getFormParameters(request);
        try {
            return OnCmd(args.get("cmd"), args, request);
        }
        catch (Exception e) {
            return Response.status(Response.Status.OK).entity(wrapAjaxError("ERROR: " + e.getMessage() + ", " + GetTrace(e))).build();
        }
    }

    Response OnCmd(String cmd, Map<String, String> items, HttpServletRequest request) throws Exception {
        JSONObject ret = new JSONObject();
        switch (cmd) {
            case "helm.monomer.load":
                LoadMonomers();
                ret = monomers.LoadRow(items.get("id"));
                break;
            case "helm.monomer.save":
                {
                    LoadMonomers();
                    String[] keys = monomers.getKeys();
                    String[] row = new String[keys.length];
                    for (int i = 0; i < keys.length; ++i)
                        row[i] = items.get(keys[i]);
                    
                    ret = monomers.SaveRecord(row);
                    if (ret != null) {
                        try {
                            monomers.Save();  
                        }
                        catch (Exception e) {
                            throw e;
                        }
                    }
                }
                break;
            case "helm.monomer.suggest":
                break;
            case "helm.monomer.list":
                {
                    LoadMonomers();
                    int page = ToInt(items.get("page"));
                    int countperpage = ToInt(items.get("countperpage"));
                    ret = monomers.List(page, countperpage);
                }
                break;
            case "helm.monomer.downloadjson":
                {
                    LoadMonomers();
                    ArrayList<JSONObject> ret2 = monomers.AsJSON();
                    String s = "scil.helm.Monomers.loadDB(" + ret2.toString() + ");";
                    return Response.status(Response.Status.OK).entity(s).build();
                }
                
            case "helm.rule.load":    
                LoadRules();
                ret = rules.LoadRow(items.get("id"));            
                break;
            case "helm.rule.save":
                {
                    LoadRules();
                    String[] keys = rules.getKeys();
                    String[] row = new String[keys.length];
                    for (int i = 0; i < keys.length; ++i)
                        row[i] = items.get(keys[i]);
                    
                    ret = rules.SaveRecord(row);
                    if (ret != null) {
                        try {
                            rules.Save();
                        }
                        catch (Exception e) {
                            throw e;
                        }
                    }
                }
                break;
            case "helm.rule.list":
                {
                    LoadRules();
                    int page = ToInt(items.get("page"));
                    int countperpage = ToInt(items.get("countperpage"));
                    ret = rules.List(page, countperpage);
                }
                break;
            case "helm.rule.downloadjson":
            case "helm.rules.downloadjson":
                {
                    LoadRules();
                    ArrayList<JSONObject> ret2 = rules.AsJSON();
                    String s = "scil.helm.RuleSet.loadDB(" + ret2.toString() + ");";
                    return Response.status(Response.Status.OK).entity(s).build();
                }
                
            case "openjsd":
                {
                    ret = new JSONObject();
                    String contents = getValue(request.getPart("file"));
                    ret.put("base64", Database.EncodeBase64(contents));
                    String s = "<html><head></head><body><textarea>" + wrapAjaxResult(ret) + "</textarea></body></html>";
                    return Response.status(Response.Status.OK).entity(s).type("text/html").build();
                }
            case "savefile":
                {
                    String filename = items.get("filename");
                    String contents = items.get("contents");
                    return Response
                        .ok(contents, "application/unknown")
                        .header("content-disposition","attachment;filename=" + filename)
                        .build();
                }
            
            default:
                return Response.status(Response.Status.OK).entity(wrapAjaxError("Unknown cmd: " + cmd)).build();
        }
    
        return Response.status(Response.Status.OK).entity(wrapAjaxResult(ret)).build();
    }
    
    static String getValue(Part part) throws IOException {
        if (part == null)
            return null;
        
        BufferedReader reader = new BufferedReader(new InputStreamReader(part.getInputStream(), "UTF-8"));
        StringBuilder value = new StringBuilder();
        char[] buffer = new char[1024];
        for (int length = 0; (length = reader.read(buffer)) > 0;) {
            value.append(buffer, 0, length);
        }
        return value.toString();
    }

    static String GetTrace(Exception e) {
        StackTraceElement[] list = e.getStackTrace();
        if (list == null)
            return null;
        
        String s = "";
        for (int i = 0; i < list.length; ++i)
            s += list[i].getFileName() + "->" + list[i].getClassName() + "->" + list[i].getMethodName() + ": line " + list[i].getLineNumber() + "|";
        return s;        
    }
    
    void LoadMonomers() {
        if (monomers == null) {
            String[] cols = {"id","symbol","name","natualanalog","molfile","smiles","polymertype","monomertype","r1","r2","r3","r4","r5","author","createddate"};
            monomers = new Database("c:\\temp\\monomers.txt", cols);
        }
    }

    void LoadRules() {
        if (rules == null) {
            String[] cols = {"id","name","note","script","author"};
            rules = new Database("c:\\temp\\rules.txt", cols);
        }
    }
    
    Map<String, String> getFormParameters(HttpServletRequest request) {
        Map<String, String[]> dict = request.getParameterMap();
        Map<String, String> ret = new HashMap<>();
        for (String k : dict.keySet()) {
            String[] list = dict.get(k);
            ret.put(k.equals("d") ? "id" : k, list == null || list.length == 0 ? null : list[0]);
        }
        
        return ret;
    }
    
    Map<String, String> getQueryParameters(HttpServletRequest request) {
        Map<String, String> queryParameters = new HashMap<>();
        String queryString = request.getQueryString();

        if (StringUtils.isEmpty(queryString)) {
            return queryParameters;
        }

        String[] parameters = queryString.split("&");

        for (String parameter : parameters) {
            String[] keyValuePair = parameter.split("=");
            queryParameters.put(keyValuePair[0], keyValuePair.length < 2 ? null : keyValuePair[1]);
        }
        return queryParameters;
    }

    static int ToInt(String s) {
        try {
            if (s == null || s.length() == 0)
                return 0;
            return Integer.parseInt(s);
        }
        catch (Exception e) {
            return 0;
        }
    }
	  
    // tool function to wrap HELM Editor acceptable json results
    public static String wrapAjaxResult(JSONObject ret) {
        JSONObject json = new JSONObject();
        json.put("succeed", true);
        json.put("ret", ret);
        return json.toString();
    }
  
    // tool function to wrap HELM Editor acceptable json results
    public static String wrapAjaxResult(java.util.ArrayList ret) {
        JSONObject json = new JSONObject();
        json.put("succeed", true);
        json.put("ret", ret);
        return json.toString();
    }

    public static String wrapAjaxError(String error) {
        JSONObject json = new JSONObject();
        json.put("succeed", false);
        json.put("error", error);
        return json.toString();
    }
}
