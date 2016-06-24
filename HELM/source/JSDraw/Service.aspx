b<!--
//////////////////////////////////////////////////////////////////////////////////
//
// JSDraw Web Services
// Copyright (C) 2014 Scilligence Corporation
// http://www.scilligence.com/
//
//////////////////////////////////////////////////////////////////////////////////
-->

<%@ Page Language="C#" AutoEventWireup="true" ValidateRequest="false" Inherits="Scilligence.MolEngine.Companion.JSDrawWS" %>
<%@ Import namespace="System.Xml" %>
<%@ Import namespace="System.Collections.Generic" %>
<%@ Import namespace="Scilligence.MolEngine" %>
<%@ Import namespace="Scilligence.MolEngine.Companion" %>

<script runat="server">      

    protected override bool OnCmd(string cmd, NameValueCollection items, System.IO.TextWriter writer, out string error)
    {
        error = null;
        if (cmd == "parsereaction")
        {
            List<Molecule> rs = new List<Molecule>();
            List<Molecule> ps = new List<Molecule>();
            
            //XmlDocument doc = Utils.Xml2Doc(....);
            XmlDocument doc = Utils.XmlFile2Doc("c:\\temp\\reaction.xml");
            XmlNodeList list = doc.SelectNodes("/reaction/reactantList/molecule");
            foreach (XmlElement e in list)
            {
                Molecule m = Molecule.Read(e.OuterXml, "cml");
                rs.Add(m);
            }
            list = doc.SelectNodes("/reaction/productList/molecule");
            foreach (XmlElement e in list)
            {
                Molecule m = Molecule.Read(e.OuterXml, "cml");
                ps.Add(m);
            }

            Reaction r = new Reaction(rs.ToArray(), ps.ToArray());
            writer.Write("{rxn:" + Utils.EscJsonStr(r.GetJSDraw()) + "}");
            
            return true;
        }

        return base.OnCmd(cmd, items, writer, out error);
    }
</script>